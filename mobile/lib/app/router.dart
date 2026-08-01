import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_controller.dart';
import '../features/auth/check_email_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/reset_link_expired_screen.dart';
import '../features/auth/reset_password_screen.dart';
import '../features/auth/reset_success_screen.dart';
import '../features/auth/splash_screen.dart';
import '../features/lecturer/lecturer_home_page.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/onboarding/sage_splash_screen.dart';
import '../features/student/course_detail_page.dart';
import '../features/student/quiz_in_progress_page.dart';
import '../features/student/quiz_results_page.dart';
import '../features/student/sage_assistant_page.dart';
import '../features/student/student_analytics_page.dart';
import '../features/student/student_courses_page.dart';
import '../features/student/student_dashboard_page.dart';
import '../features/student/student_error_pages.dart';
import '../features/student/student_home_page.dart';
import '../features/student/student_notifications_page.dart';
import '../features/student/student_profile_page.dart';
import '../features/student/student_settings_page.dart';
import '../features/student/student_tasks_page.dart';
import '../features/student/submit_assignment_page.dart';
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
      final onAuth = path.startsWith('/auth');
      final isPublic = onLaunch || onSplash || onAuth;

      switch (auth.status) {
        case AuthStatus.restoring:
        case AuthStatus.unauthenticated:
          return isPublic ? null : '/splash';
        case AuthStatus.authenticated:
          final role = auth.user!.role;
          if (onLaunch || onSplash || onAuth) return homeFor(role);
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
      // ---- Auth (public, pre-session) ----
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/auth/check-email',
        builder: (context, state) => const CheckEmailScreen(),
      ),
      GoRoute(
        path: '/auth/reset-password',
        builder: (context, state) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: '/auth/reset-link-expired',
        builder: (context, state) => const ResetLinkExpiredScreen(),
      ),
      GoRoute(
        path: '/auth/reset-success',
        builder: (context, state) => const ResetSuccessScreen(),
      ),
      // ---- Student area ----
      GoRoute(
        path: '/student/home',
        builder: (context, state) => const StudentDashboardPage(),
      ),
      GoRoute(
        path: '/student/courses',
        builder: (context, state) => const StudentCoursesPage(),
      ),
      GoRoute(
        path: '/student/tasks',
        builder: (context, state) => const StudentTasksPage(),
      ),
      GoRoute(
        path: '/student/analytics',
        builder: (context, state) => const StudentAnalyticsPage(),
      ),
      GoRoute(
        path: '/student/notifications',
        builder: (context, state) => const StudentNotificationsPage(),
      ),
      GoRoute(
        path: '/student/profile',
        builder: (context, state) => const StudentProfilePage(),
      ),
      GoRoute(
        path: '/student/settings',
        builder: (context, state) => const StudentSettingsPage(),
      ),
      GoRoute(
        path: '/student/assistant',
        builder: (context, state) => const SageAssistantPage(),
      ),
      GoRoute(
        path: '/student/course/:courseId',
        builder: (context, state) =>
            CourseDetailPage(courseId: state.pathParameters['courseId']!),
      ),
      GoRoute(
        path: '/student/submit/:assignmentId',
        builder: (context, state) => SubmitAssignmentPage(
          assignmentId: state.pathParameters['assignmentId']!,
        ),
      ),
      GoRoute(
        path: '/student/quiz/:quizId',
        builder: (context, state) =>
            QuizInProgressPage(quizId: state.pathParameters['quizId']!),
      ),
      GoRoute(
        path: '/student/quiz-results/:quizId',
        builder: (context, state) =>
            QuizResultsPage(quizId: state.pathParameters['quizId']!),
      ),
      GoRoute(
        path: '/student/error/403',
        builder: (context, state) => const Student403Page(),
      ),
      GoRoute(
        path: '/student/error/404',
        builder: (context, state) => const Student404Page(),
      ),
      GoRoute(
        path: '/student/error/500',
        builder: (context, state) => const StudentSystemErrorPage(),
      ),
      GoRoute(
        path: '/student/loading',
        builder: (context, state) => const StudentLoadingPage(),
      ),
      for (final tab in studentPlaceholderTabs)
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
