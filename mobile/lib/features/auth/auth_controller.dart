import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/mock/mock_auth_repository.dart';

/// The repository binding — the single swap point when the Express API lands
/// (Phase 6). Nothing above this line knows or cares which impl is bound.
final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => MockAuthRepository(),
);

enum AuthStatus { restoring, unauthenticated, authenticated }

class AuthState {
  const AuthState({required this.status, this.user});

  const AuthState.restoring() : this(status: AuthStatus.restoring);

  const AuthState.unauthenticated()
      : this(status: AuthStatus.unauthenticated);

  const AuthState.authenticated(User user)
      : this(status: AuthStatus.authenticated, user: user);

  final AuthStatus status;
  final User? user;

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState.restoring();

  /// Restores any persisted session on app start.
  Future<void> restore() async {
    final repo = ref.read(authRepositoryProvider);
    final user = await repo.currentUser();
    state = user != null
        ? AuthState.authenticated(user)
        : const AuthState.unauthenticated();
  }

  Future<User> signIn({
    required String email,
    required String password,
  }) async {
    final repo = ref.read(authRepositoryProvider);
    final user = await repo.signIn(email: email, password: password);
    state = AuthState.authenticated(user);
    return user;
  }

  /// Creates an account without starting a session. Callers route to login.
  Future<User> register({
    required String fullName,
    required String email,
    required String password,
    Role role = Role.student,
  }) {
    return ref
        .read(authRepositoryProvider)
        .register(fullName: fullName, email: email, password: password, role: role);
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AuthState.unauthenticated();
  }
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
