import '../models/user.dart';

/// Contract for authentication, mirroring `/auth/*` endpoints in `api-reference.md`.
///
/// Phase 2 wires this to the real Express API. The mock implementation below
/// powers the app until then — the interface keeps call sites unchanged.
abstract interface class AuthRepository {
  /// Returns the currently authenticated user, or `null` when signed out.
  Future<User?> currentUser();

  /// Authenticates with email + password. Throws `SageAuthException` on failure.
  Future<User> signIn({required String email, required String password});

  /// Creates a new account (student self-registration). Does not start a
  /// session — the user signs in afterwards. Throws `SageAuthException` on
  /// failure (duplicate email, invalid role, ...).
  Future<User> register({
    required String fullName,
    required String email,
    required String password,
    Role role = Role.student,
  });

  /// Ends the session and revokes tokens.
  Future<void> signOut();
}

/// Typed failure for auth flows; maps `AUTH_INVALID_CREDENTIALS` etc.
class SageAuthException implements Exception {
  const SageAuthException(this.message);

  final String message;

  @override
  String toString() => message;
}
