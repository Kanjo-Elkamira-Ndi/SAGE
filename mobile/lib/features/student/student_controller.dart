import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/app_providers.dart';
import '../../core/pagination.dart';
import '../../data/models/api/course.dart';
import '../../data/models/api/notification.dart';
import '../../data/models/api/performance.dart';
import '../../data/models/student.dart';
import '../../data/repositories/api/api_course_repository.dart';
import '../../data/repositories/api/api_notification_repository.dart';
import '../../data/repositories/api/api_performance_repository.dart';
import '../../data/repositories/mock/mock_student_repository.dart';
import '../../data/repositories/student_repository.dart';

/// ---- API-backed bindings (`api-wiring-plan.md` §A.2). ---------------------
/// The student Dashboard, Courses and Notifications screens read these;
/// the remaining screens still use the mock `studentControllerProvider`
/// until their slice lands.

final apiCourseRepositoryProvider = Provider<ApiCourseRepository>(
  (ref) => ApiCourseRepository(client: ref.watch(apiClientProvider)),
);

final apiNotificationRepositoryProvider = Provider<ApiNotificationRepository>(
  (ref) => ApiNotificationRepository(client: ref.watch(apiClientProvider)),
);

final apiPerformanceRepositoryProvider = Provider<ApiPerformanceRepository>(
  (ref) => ApiPerformanceRepository(client: ref.watch(apiClientProvider)),
);

/// Enrolled courses (page 1, default limit).
final apiCoursesProvider = FutureProvider<Page<ApiCourse>>(
  (ref) => ref.watch(apiCourseRepositoryProvider).listCourses(),
);

/// Latest notifications with unread count.
final apiNotificationsProvider = FutureProvider<Page<ApiNotification>>(
  (ref) => ref.watch(apiNotificationRepositoryProvider).list(),
);

/// Own overall performance snapshot + metrics.
final apiPerformanceProvider = FutureProvider<ApiStudentPerformance>(
  (ref) => ref.watch(apiPerformanceRepositoryProvider).me(),
);

/// Own at-risk breakdown.
final apiRiskProvider = FutureProvider<ApiRiskDetail>(
  (ref) => ref.watch(apiPerformanceRepositoryProvider).myRisk(),
);

/// ---- Mock binding (unwired screens). --------------------------------------

/// Student data binding — the single swap point for the Phase 6 API.
final studentRepositoryProvider = Provider<StudentRepository>(
  (ref) => MockStudentRepository(),
);

/// Thin read-only controller exposing seeded student data to widgets.
class StudentController extends Notifier<List<Object?>> {
  @override
  List<Object?> build() => const [];

  StudentRepository get _repo => ref.read(studentRepositoryProvider);

  List<StudentCourse> get courses => _repo.getCourses();

  StudentCourse courseById(String id) => _repo.courseById(id);

  List<Assignment> get assignments => _repo.getAssignments();

  Assignment assignmentById(String id) => _repo.assignmentById(id);

  List<Quiz> get quizzes => _repo.getQuizzes();

  Quiz quizById(String id) => _repo.quizById(id);

  List<AppNotification> get notifications => _repo.getNotifications();
}

final studentControllerProvider =
    NotifierProvider<StudentController, List<Object?>>(StudentController.new);
