import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_controller.dart';
import '../features/auth/splash_screen.dart';
import '../features/lecturer/lecturer_home_page.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/onboarding/sage_splash_screen.dart';
import '../features/student/student_home_page.dart';
import 'router_helpers.dart';

/// Role-aware router. Redirect rules:
/// - No/restoring session → `/launch` (branded splash) → `/onboarding`.
/// - Authenticated but on a public/launch route → their role home.
/// - Authenticated but on another role's area → their role home.
final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/launch',
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final path = state.matchedLocation;
      final onLaunch = path == '/launch' || path == '/onboarding';
      final onSplash = path == '/splash';

      switch (auth.status) {
        case AuthStatus.restoring:
        case AuthStatus.unauthenticated:
          return (onLaunch || onSplash) ? null : '/splash';
        case AuthStatus.authenticated:
          final role = auth.user!.role;
          if (onLaunch || onSplash) return homeFor(role);
          if (isRoleArea(role, path)) return null;
          return homeFor(role);
      }
    },
    routes: [
      GoRoute(
        path: '/launch',
        builder: (context, state) => const SageSplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      // ---- Student area ----
      GoRoute(
        path: '/student/home',
        builder: (context, state) => const StudentHomePage(),
      ),
      for (final tab in studentTabs)
        GoRoute(
          path: tab.path,
          builder: (context, state) =>
              StudentPlaceholderPage(title: tab.title),
        ),
      // ---- Lecturer area ----
      GoRoute(
        path: '/lecturer/home',
        builder: (context, state) => const LecturerHomePage(),
      ),
      for (final tab in lecturerTabs)
        GoRoute(
          path: tab.path,
          builder: (context, state) =>
              LecturerPlaceholderPage(title: tab.title),
        ),
    ],
  );

  // Re-evaluate redirects when auth state changes (login/logout).
  ref.listen(authControllerProvider, (prev, next) => router.refresh());

  return router;
});
