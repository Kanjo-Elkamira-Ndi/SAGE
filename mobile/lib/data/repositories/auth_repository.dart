import '../models/user.dart';
import '../../core/sage_exception.dart';

/// Contract for authentication, mirroring `/auth/*` endpoints in `api-reference.md`.
///
/// The API implementation (`ApiAuthRepository`) talks to the real Express
/// server; `MockAuthRepository` powers tests and offline development. The
/// interface keeps call sites unchanged.
abstract interface class AuthRepository {
  /// Returns the currently authenticated user, or `null` when signed out.
  Future<User?> currentUser();

  /// Authenticates with email + password. Throws [SageException] on failure
  /// (`AUTH_INVALID_CREDENTIALS`, `USER_PENDING_APPROVAL`, ...).
  Future<User> signIn({required String email, required String password});

  /// Creates a new account (student self-registration). Does not start a
  /// session — the user signs in afterwards. Throws [SageException] on
  /// failure (duplicate email, invalid role, ...).
  Future<User> register({
    required String fullName,
    required String email,
    required String password,
    Role role = Role.student,
  });

  /// Ends the session and revokes tokens.
  Future<void> signOut();

  /// Requests a password-reset link/email. Always succeeds (no enumeration).
  Future<void> forgotPassword({required String email});

  /// Applies a password reset with the token from the emailed link.
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });
}
