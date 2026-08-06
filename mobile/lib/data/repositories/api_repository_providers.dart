/// Shared API repository bindings (`api-wiring-plan.md` §A.2). Both the
/// student and lecturer feature areas construct their providers on top of
/// these; they are the single construction point for each HTTP repository.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/app_providers.dart';
import 'api/api_announcement_repository.dart';
import 'api/api_assignment_repository.dart';
import 'api/api_course_repository.dart';
import 'api/api_exam_repository.dart';
import 'api/api_material_repository.dart';
import 'api/api_notification_repository.dart';
import 'api/api_performance_repository.dart';
import 'api/api_quiz_repository.dart';

final apiCourseRepositoryProvider = Provider<ApiCourseRepository>(
  (ref) => ApiCourseRepository(client: ref.watch(apiClientProvider)),
);

final apiNotificationRepositoryProvider = Provider<ApiNotificationRepository>(
  (ref) => ApiNotificationRepository(client: ref.watch(apiClientProvider)),
);

final apiPerformanceRepositoryProvider = Provider<ApiPerformanceRepository>(
  (ref) => ApiPerformanceRepository(client: ref.watch(apiClientProvider)),
);

final apiMaterialRepositoryProvider = Provider<ApiMaterialRepository>(
  (ref) => ApiMaterialRepository(client: ref.watch(apiClientProvider)),
);

final apiAssignmentRepositoryProvider = Provider<ApiAssignmentRepository>(
  (ref) => ApiAssignmentRepository(client: ref.watch(apiClientProvider)),
);

final apiQuizRepositoryProvider = Provider<ApiQuizRepository>(
  (ref) => ApiQuizRepository(client: ref.watch(apiClientProvider)),
);

final apiExamRepositoryProvider = Provider<ApiExamRepository>(
  (ref) => ApiExamRepository(client: ref.watch(apiClientProvider)),
);

final apiAnnouncementRepositoryProvider = Provider<ApiAnnouncementRepository>(
  (ref) => ApiAnnouncementRepository(client: ref.watch(apiClientProvider)),
);
