import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/pagination.dart';
import '../../data/models/api/announcement.dart';
import '../../data/models/api/assignment.dart';
import '../../data/models/api/course.dart';
import '../../data/models/api/exam.dart';
import '../../data/models/api/material.dart';
import '../../data/models/api/notification.dart';
import '../../data/models/api/performance.dart';
import '../../data/models/api/quiz.dart';
import '../../data/repositories/api_repository_providers.dart';

export '../../data/repositories/api_repository_providers.dart';

/// Student API bindings (`api-wiring-plan.md` §A.2). All student screens read
/// these providers; the mock `studentRepositoryProvider`/`studentController`
/// bindings were removed with the mock layer.

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

/// Single course from the enrolled list.
final apiCourseByIdProvider = FutureProvider.family<ApiCourse, String>(
  (ref, id) async {
    final page = await ref.watch(apiCoursesProvider.future);
    return page.items.firstWhere(
      (c) => c.id == id,
      orElse: () => throw StateError('Course $id not found'),
    );
  },
);

/// Materials for one course.
final apiMaterialsForCourseProvider =
    FutureProvider.family<List<ApiMaterial>, String>(
  (ref, courseId) =>
      ref.watch(apiMaterialRepositoryProvider).listForCourse(courseId),
);

/// Assignments for one course.
final apiAssignmentsForCourseProvider =
    FutureProvider.family<List<ApiAssignment>, String>(
  (ref, courseId) =>
      ref.watch(apiAssignmentRepositoryProvider).listForCourse(courseId),
);

/// Quizzes for one course.
final apiQuizzesForCourseProvider = FutureProvider.family<List<ApiQuiz>, String>(
  (ref, courseId) =>
      ref.watch(apiQuizRepositoryProvider).listForCourse(courseId),
);

/// Exams for one course.
final apiExamsForCourseProvider = FutureProvider.family<List<ApiExam>, String>(
  (ref, courseId) => ref.watch(apiExamRepositoryProvider).listForCourse(courseId),
);

/// School-wide announcements (used for the course feed on course detail).
final apiAnnouncementsProvider = FutureProvider<Page<ApiAnnouncement>>(
  (ref) => ref.watch(apiAnnouncementRepositoryProvider).list(),
);

/// Assignments across every enrolled course (Tasks tab). The API only exposes
/// per-course lists, so this fans out over the enrolled courses.
final apiAllAssignmentsProvider = FutureProvider<List<ApiAssignment>>(
  (ref) async {
    final courses = await ref.watch(apiCoursesProvider.future);
    final results = <ApiAssignment>[];
    for (final course in courses.items) {
      results.addAll(
        await ref.watch(apiAssignmentsForCourseProvider(course.id).future),
      );
    }
    return results;
  },
);

/// Quizzes across every enrolled course (Tasks tab).
final apiAllQuizzesProvider = FutureProvider<List<ApiQuiz>>(
  (ref) async {
    final courses = await ref.watch(apiCoursesProvider.future);
    final results = <ApiQuiz>[];
    for (final course in courses.items) {
      results.addAll(
        await ref.watch(apiQuizzesForCourseProvider(course.id).future),
      );
    }
    return results;
  },
);

/// Course code by id — resolves `ApiAssignment.courseId` → code for badges.
String courseCodeOf(List<ApiCourse> courses, String courseId) =>
    courses.firstWhere(
      (c) => c.id == courseId,
      orElse: () => ApiCourse(
        id: courseId,
        code: '?',
        title: '?',
        lecturerName: '',
      ),
    ).code;

/// Single assignment by id (submit screen). Search across enrolled courses.
final apiAssignmentByIdProvider = FutureProvider.family<ApiAssignment, String>(
  (ref, id) async {
    final all = await ref.watch(apiAllAssignmentsProvider.future);
    return all.firstWhere(
      (a) => a.id == id,
      orElse: () => throw StateError('Assignment $id not found'),
    );
  },
);

/// Single quiz by id (attempt + results headers).
final apiQuizByIdProvider = FutureProvider.family<ApiQuiz, String>(
  (ref, id) async {
    final all = await ref.watch(apiAllQuizzesProvider.future);
    return all.firstWhere(
      (q) => q.id == id,
      orElse: () => throw StateError('Quiz $id not found'),
    );
  },
);

/// Latest attempt results for a quiz (`GET /quizzes/:id/results`).
final apiQuizResultsProvider =
    FutureProvider.family<ApiQuizResultsDetail, String>(
  (ref, quizId) => ref.watch(apiQuizRepositoryProvider).results(quizId),
);
