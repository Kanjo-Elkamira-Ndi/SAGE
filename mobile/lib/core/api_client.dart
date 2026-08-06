import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

import 'auth_storage.dart';
import 'sage_exception.dart';

/// HTTP client for the SAGE API.
///
/// Implements the shared client contract (`api-wiring-plan.md` §0):
/// - Base URL + `Bearer` injection from `AuthStorage`.
/// - Response-envelope unwrapping (`{ success, data }`).
/// - Error mapping to typed `SageException` / `SageNetworkException`.
/// - 401 → single-flight refresh → retry; `AUTH_TOKEN_REUSED` and refresh
///   failures call `onSessionExpired` so the app signs out everywhere.
/// - Persisted cookie jar so the httpOnly refresh cookie survives restarts.
class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.storage,
    required this.onSessionExpired,
    Dio? dio,
    CookieJar? cookieJar,
  }) : _dio = dio ?? Dio() {
    _dio.options
      ..baseUrl = baseUrl
      ..connectTimeout = const Duration(seconds: 15)
      ..receiveTimeout = const Duration(seconds: 30)
      ..sendTimeout = const Duration(seconds: 30)
      ..validateStatus = (status) => status != null && status < 500;

    if (cookieJar != null) {
      _dio.interceptors.add(CookieManager(cookieJar));
    }

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final outcome = await _handleError(error);
          if (outcome is Response<dynamic>) {
            handler.resolve(outcome);
          } else {
            final sageError = outcome as SageException;
            handler.reject(
              DioException(
                requestOptions: error.requestOptions,
                response: error.response,
                type: error.type,
                error: sageError,
              ),
            );
          }
        },
      ),
    );
  }

  final String baseUrl;
  final AuthStorage storage;
  final void Function() onSessionExpired;
  final Dio _dio;

  static const _retryHeader = 'x-sage-retried';

  Future<bool>? _refreshFuture;

  /// Creates a client with a cookie jar persisted to disk (survives app
  /// restarts, keeping the httpOnly refresh cookie valid).
  static Future<ApiClient> create({
    required String baseUrl,
    required AuthStorage storage,
    required void Function() onSessionExpired,
  }) async {
    final dir = await getApplicationSupportDirectory();
    final jar = PersistCookieJar(
      storage: FileStorage('${dir.path}/cookies'),
      ignoreExpires: false,
    );
    return ApiClient(
      baseUrl: baseUrl,
      storage: storage,
      onSessionExpired: onSessionExpired,
      cookieJar: jar,
    );
  }

  // ---- HTTP verbs (envelope-unwrapped) -----------------------------------

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final res = await _dio.get<dynamic>(path, queryParameters: query);
      return _unwrap(res);
    } on DioException catch (error) {
      throw _rethrow(error);
    }
  }

  Future<dynamic> post(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
  }) async {
    try {
      final res = await _dio.post<dynamic>(path, data: body, queryParameters: query);
      return _unwrap(res);
    } on DioException catch (error) {
      throw _rethrow(error);
    }
  }

  Future<dynamic> patch(String path, {Object? body}) async {
    try {
      final res = await _dio.patch<dynamic>(path, data: body);
      return _unwrap(res);
    } on DioException catch (error) {
      throw _rethrow(error);
    }
  }

  Future<dynamic> delete(String path, {Object? body}) async {
    try {
      final res = await _dio.delete<dynamic>(path, data: body);
      return _unwrap(res);
    } on DioException catch (error) {
      throw _rethrow(error);
    }
  }

  /// Raw response (no envelope unwrap) — for CSV / file downloads.
  Future<Response<dynamic>> getRaw(String path, {Map<String, dynamic>? query}) async {
    try {
      return await _dio.get<dynamic>(path, queryParameters: query);
    } on DioException catch (error) {
      throw _rethrow(error);
    }
  }

  /// Uploads raw bytes to a presigned object-storage URL (e.g. GCS). Uses a
  /// dedicated, auth-free `Dio` so the bearer token is never sent to the
  /// storage host and the cookie/refresh interceptors are skipped.
  Future<void> uploadToSignedUrl(
    String url, {
    required List<int> bytes,
    required String contentType,
  }) async {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );
    await dio.put<dynamic>(
      url,
      data: bytes,
      options: Options(contentType: contentType),
    );
  }

  // ---- Envelope + error handling -----------------------------------------

  dynamic _unwrap(Response<dynamic> res) {
    final body = res.data;
    if (body is Map<String, dynamic>) {
      if (body['success'] == true) return body['data'];
      throw _fromEnvelope(body, res.statusCode);
    }
    return body;
  }

  Never _rethrow(DioException error) {
    final thrown = error.error;
    if (thrown is SageException) throw thrown;
    throw SageNetworkException('Something went wrong. Please try again.');
  }

  SageException _fromEnvelope(Map<String, dynamic> body, int? status) {
    final error = body['error'] as Map<String, dynamic>? ?? const {};
    final code = (error['code'] as String?) ?? 'UNKNOWN_ERROR';
    final message = (error['message'] as String?) ?? 'Something went wrong.';
    final details = (error['details'] as Map<String, dynamic>?) ?? const {};
    final rawFields = details['fieldErrors'] as Map<String, dynamic>? ?? const {};
    final fieldErrors = <String, List<String>>{
      for (final e in rawFields.entries)
        e.key: (e.value as List<dynamic>).map((v) => v.toString()).toList(),
    };
    return SageException(
      code: code,
      message: sageErrorCopy(code, message),
      fieldErrors: fieldErrors,
      statusCode: status,
    );
  }

  /// Returns a `SageException` to throw, or a `Response` to resolve (retry).
  Future<Object> _handleError(DioException error) async {
    final status = error.response?.statusCode;
    final body = error.response?.data;

    // Transport failures → never touch the server message.
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return SageNetworkException('Connection timed out. Please try again.');
    }
    if (error.type == DioExceptionType.connectionError) {
      return SageNetworkException(
        'No internet connection. Please check and retry.',
      );
    }

    final request = error.requestOptions;
    final alreadyRetried = request.headers[_retryHeader] == '1';

    // Refreshable 401 (expired access token) on a non-refresh request that
    // has not already been retried.
    if (status == 401 &&
        !alreadyRetried &&
        _isExpiredToken(body) &&
        !request.path.contains('/auth/refresh')) {
      final refreshed = await _refreshAccessToken();
      if (refreshed) {
        request.headers[_retryHeader] = '1';
        return _dio.fetch<dynamic>(request);
      }
      return const SageSessionExpiredException();
    }

    final parsed = _parseEnvelope(status, body);
    if (parsed.isReusedSession || parsed.isAuthExpired) {
      onSessionExpired();
    }
    return parsed;
  }

  bool _isExpiredToken(Object? body) {
    if (body is! Map<String, dynamic>) return false;
    final error = body['error'] as Map<String, dynamic>?;
    return error?['code'] == 'AUTH_TOKEN_EXPIRED';
  }

  SageException _parseEnvelope(int? status, Object? body) {
    if (status != null && body is Map<String, dynamic> && body['error'] is Map<String, dynamic>) {
      return _fromEnvelope(body, status);
    }
    return SageNetworkException('Something went wrong. Please try again.');
  }

  /// Single-flight refresh. Returns true when a new access token was stored.
  Future<bool> _refreshAccessToken() {
    return (_refreshFuture ??= _doRefresh()).then((result) {
      if (_refreshFuture != null) _refreshFuture = null;
      return result;
    });
  }

  Future<bool> _doRefresh() async {
    try {
      final res = await _dio.post<dynamic>('/auth/refresh');
      final body = res.data;
      if (body is Map<String, dynamic> && body['success'] == true) {
        final data = body['data'] as Map<String, dynamic>;
        final token = data['accessToken'] as String?;
        if (token != null && token.isNotEmpty) {
          await storage.writeAccessToken(token);
          final user = data['user'] as Map<String, dynamic>?;
          if (user != null) await storage.writeCachedUser(user);
          return true;
        }
      }
      onSessionExpired();
      return false;
    } on DioException catch (error) {
      final code = _codeOf(error);
      if (code == 'AUTH_TOKEN_REUSED' || error.response?.statusCode == 401) {
        onSessionExpired();
      }
      return false;
    }
  }

  String? _codeOf(DioException error) {
    final body = error.response?.data;
    if (body is Map<String, dynamic> && body['error'] is Map<String, dynamic>) {
      return (body['error'] as Map<String, dynamic>)['code'] as String?;
    }
    final thrown = error.error;
    return thrown is SageException ? thrown.code : null;
  }
}
