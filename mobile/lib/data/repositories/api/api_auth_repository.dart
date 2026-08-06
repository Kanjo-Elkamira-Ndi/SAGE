import '../../../core/api_client.dart';
import '../../../core/auth_storage.dart';
import '../../../core/sage_exception.dart';
import '../../models/user.dart';
import '../auth_repository.dart';

/// Real `/auth/*` implementation of `AuthRepository` (`api-wiring-plan.md`
/// §A.1). Session restores via `GET /auth/me`; the 401 → refresh → retry loop
/// lives in `ApiClient`.
class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository({required this.client, required this.storage});

  final ApiClient client;
  final AuthStorage storage;

  @override
  Future<User?> currentUser() async {
    final token = await storage.readAccessToken();
    if (token == null || token.isEmpty) return null;

    try {
      final data = await client.get('/auth/me') as Map<String, dynamic>;
      final user = User.fromApi(data);
      await storage.writeCachedUser(data);
      await storage.writeSessionFlag(true);
      return user;
    } on SageSessionExpiredException {
      await storage.clear();
      return null;
    } on SageException catch (error) {
      if (error.isAuthExpired || error.isReusedSession) {
        await storage.clear();
        return null;
      }
      rethrow;
    }
  }

  @override
  Future<User> signIn({required String email, required String password}) async {
    final data =
        await client.post('/auth/login', body: {
              'email': email,
              'password': password,
            })
            as Map<String, dynamic>;

    final token = data['accessToken'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = User.fromApi(userJson);

    await storage.writeAccessToken(token);
    await storage.writeCachedUser(userJson);
    await storage.writeSessionFlag(true);
    return user;
  }

  @override
  Future<User> register({
    required String fullName,
    required String email,
    required String password,
    Role role = Role.student,
  }) async {
    final data =
        await client.post('/auth/register', body: {
              'fullName': fullName,
              'email': email,
              'password': password,
              'role': role.name,
            })
            as Map<String, dynamic>;

    // Students self-activate; lecturer/admin signups stay `pendingApproval`
    // until an admin approves. No session is started either way.
    return User.fromApi(data['user'] as Map<String, dynamic>);
  }

  @override
  Future<void> signOut() async {
    try {
      await client.post('/auth/logout');
    } on SageException {
      // Even if the server rejects the revoke, wipe the local session.
    }
    await storage.clear();
  }

  @override
  Future<void> forgotPassword({required String email}) async {
    await client.post('/auth/forgot-password', body: {'email': email});
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await client.post(
      '/auth/reset-password',
      body: {'token': token, 'newPassword': newPassword},
    );
  }
}
