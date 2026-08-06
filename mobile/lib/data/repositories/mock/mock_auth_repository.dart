import '../../../core/sage_exception.dart';
import '../../models/user.dart';
import '../auth_repository.dart';

/// In-memory auth with demo accounts per role. Used until Phase 2 wires the
/// real `/auth/*` endpoints. Password is only checked for non-empty (demo).
class MockAuthRepository implements AuthRepository {
  MockAuthRepository();

  static const demoStudent = User(
    id: 'u-student-001',
    email: 'alex.carter@student.sage.edu',
    fullName: 'Alex Carter',
    role: Role.student,
    departmentName: 'Computer Science',
    avatarUrl: 'assets/images/student/avatar_alex.jpg',
  );

  static const demoLecturer = User(
    id: 'u-lecturer-001',
    email: 'prof.rivers@sage.edu',
    fullName: 'Prof. Rivers',
    role: Role.lecturer,
    departmentName: 'Psychology',
  );

  static const demoAdmin = User(
    id: 'u-admin-001',
    email: 'admin@sage.edu',
    fullName: 'Admin',
    role: Role.admin,
  );

  final Map<String, User> _registered = {
    demoStudent.email: demoStudent,
    demoLecturer.email: demoLecturer,
    demoAdmin.email: demoAdmin,
  };

  User? _session;

  @override
  Future<User?> currentUser() async => _session;

  @override
  Future<User> register({
    required String fullName,
    required String email,
    required String password,
    Role role = Role.student,
  }) async {
    final normalized = email.toLowerCase().trim();
    if (normalized.isEmpty) {
      throw const SageException(code: 'AUTH_FAILED', message: 'Please enter your email address.');
    }
    if (password.isEmpty) {
      throw const SageException(code: 'AUTH_FAILED', message: 'Please enter a password.');
    }
    if (_registered.containsKey(normalized)) {
      throw const SageException(code: 'AUTH_FAILED', message: 'An account already exists for that email.');
    }
    final user = User(
      id: 'u-${_registered.length + 1}-$normalized',
      email: normalized,
      fullName: fullName.trim().isEmpty ? 'New User' : fullName.trim(),
      role: role,
      departmentName: role == Role.student ? 'General Studies' : null,
    );
    _registered[normalized] = user;
    return user;
  }

  @override
  Future<User> signIn({required String email, required String password}) async {
    if (password.isEmpty) {
      throw const SageException(code: 'AUTH_FAILED', message: 'Please enter your password.');
    }
    final normalized = email.toLowerCase().trim();
    final user = switch (normalized) {
      'student' => demoStudent,
      'lecturer' => demoLecturer,
      'admin' => demoAdmin,
      _ => null,
    };
    if (user == null) {
      throw const SageException(code: 'AUTH_FAILED', message: 'No account found for that email.');
    }
    _session = user;
    return user;
  }

  @override
  Future<void> signOut() async {
    _session = null;
  }

  @override
  Future<void> forgotPassword({required String email}) async {
    // Demo: nothing to send.
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    // Demo: nothing to verify.
  }
}
