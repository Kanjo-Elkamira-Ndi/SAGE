import '../../../core/api_client.dart';
import '../../models/api/material.dart';

/// Material endpoints (`api-wiring-plan.md` A.2 / A.3): list per course,
/// signed upload/finalize, new versions, and signed download.
class ApiMaterialRepository {
  ApiMaterialRepository({required this.client});

  final ApiClient client;

  /// `GET /courses/:id/materials` → `data: { courseId, materials }`.
  Future<List<ApiMaterial>> listForCourse(String courseId) async {
    final data = await client.get('/courses/$courseId/materials');
    final json = data as Map<String, dynamic>;
    return (json['materials'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ApiMaterial.fromJson)
        .toList();
  }

  /// `POST /materials/upload-url` (lecturer only).
  Future<ApiUploadUrl> uploadUrl({
    required String courseId,
    required String fileName,
    required String contentType,
    required int fileSizeBytes,
  }) async {
    final data = await client.post('/materials/upload-url', body: {
      'courseId': courseId,
      'fileName': fileName,
      'contentType': contentType,
      'fileSizeBytes': fileSizeBytes,
    });
    return ApiUploadUrl.fromJson(data as Map<String, dynamic>);
  }

  /// `POST /materials` — finalize a finished upload (lecturer only).
  Future<ApiMaterial> finalize({
    required String courseId,
    required String storageKey,
    required String title,
    String? contentType,
    int? fileSizeBytes,
  }) async {
    final data = await client.post('/materials', body: {
      'courseId': courseId,
      'storageKey': storageKey,
      'title': title,
      'contentType': contentType,
      'fileSizeBytes': fileSizeBytes,
    });
    return ApiMaterial.fromJson(
      (data as Map<String, dynamic>)['material'] as Map<String, dynamic>,
    );
  }

  /// `POST /materials/:id/versions` — replace a material with a new file.
  Future<ApiMaterial> newVersion(
    String materialId, {
    required String storageKey,
    String? title,
    String? contentType,
    int? fileSizeBytes,
    String? courseId,
  }) async {
    final data = await client.post('/materials/$materialId/versions', body: {
      'storageKey': storageKey,
      'title': title,
      'contentType': contentType,
      'fileSizeBytes': fileSizeBytes,
      'courseId': courseId,
    });
    return ApiMaterial.fromJson(
      (data as Map<String, dynamic>)['material'] as Map<String, dynamic>,
    );
  }

  /// `GET /materials/:id/download-url` → short-lived signed URL.
  Future<String> downloadUrl(String materialId) async {
    final data = await client.get('/materials/$materialId/download-url');
    return (data as Map<String, dynamic>)['downloadUrl'] as String;
  }
}
