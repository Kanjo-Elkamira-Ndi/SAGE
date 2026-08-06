import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/pagination.dart';
import '../../data/models/api/announcement.dart';
import '../../data/models/api/assignment.dart';
import '../../data/models/api/course.dart';
import '../../data/models/api/exam.dart';
import '../../data/models/api/material.dart';
import '../../data/models/api/performance.dart';
import '../../data/models/api/quiz.dart';
import '../../data/repositories/api_repository_providers.dart';

export '../../data/repositories/api_repository_providers.dart';

/// Lecturer API bindings (`api-wiring-plan.md` §B). Built on the shared
/// repository providers in `api_repository_providers.dart`; the mock
/// `lecturerRepositoryProvider`/`lecturerControllerProvider` have been
/// removed along with the mock repository.

/// Courses taught by the lecturer (`GET /courses` returns owned courses for
/// the lecturer role).
final lecturerApiCoursesProvider = FutureProvider<Page<ApiCourse>>(
  (ref) => ref.watch(apiCourseRepositoryProvider).listCourses(),
);

/// Single course from the taught list, by id.
final lecturerApiCourseByIdProvider = FutureProvider.family<ApiCourse, String>(
  (ref, id) async {
    final page = await ref.watch(lecturerApiCoursesProvider.future);
    return page.items.firstWhere(
      (c) => c.id == id,
      orElse: () => throw StateError('Course $id not found'),
    );
  },
);

/// Materials for one taught course.
final lecturerMaterialsForCourseProvider =
    FutureProvider.family<List<ApiMaterial>, String>(
  (ref, courseId) =>
      ref.watch(apiMaterialRepositoryProvider).listForCourse(courseId),
);

/// Assignments for one taught course.
final lecturerAssignmentsForCourseProvider =
    FutureProvider.family<List<ApiAssignment>, String>(
  (ref, courseId) =>
      ref.watch(apiAssignmentRepositoryProvider).listForCourse(courseId),
);

/// Quizzes for one taught course.
final lecturerQuizzesForCourseProvider =
    FutureProvider.family<List<ApiQuiz>, String>(
  (ref, courseId) => ref.watch(apiQuizRepositoryProvider).listForCourse(courseId),
);

/// Exams for one taught course.
final lecturerExamsForCourseProvider =
    FutureProvider.family<List<ApiExam>, String>(
  (ref, courseId) => ref.watch(apiExamRepositoryProvider).listForCourse(courseId),
);

/// Assignments across every taught course (Tasks tab).
final lecturerAllAssignmentsProvider = FutureProvider<List<ApiAssignment>>(
  (ref) async {
    final courses = await ref.watch(lecturerApiCoursesProvider.future);
    final results = <ApiAssignment>[];
    for (final course in courses.items) {
      results.addAll(
        await ref.watch(lecturerAssignmentsForCourseProvider(course.id).future),
      );
    }
    return results;
  },
);

/// Submissions for one assignment (grading queue).
final lecturerSubmissionsForAssignmentProvider =
    FutureProvider.family<List<ApiSubmission>, String>(
  (ref, assignmentId) =>
      ref.watch(apiAssignmentRepositoryProvider).listSubmissions(assignmentId),
);

/// Grading summary `(total, graded)` for one assignment.
final lecturerAssignmentGradingSummaryProvider =
    FutureProvider.family<({int total, int graded}), String>(
  (ref, assignmentId) async {
    final submissions = await ref
        .watch(lecturerSubmissionsForAssignmentProvider(assignmentId).future);
    final graded = submissions.where((s) => s.score != null).length;
    return (total: submissions.length, graded: graded);
  },
);

/// Count of ungraded submissions across all assignments (dashboard KPI).
final lecturerPendingGradingCountProvider = FutureProvider<int>((ref) async {
  final assignments = await ref.watch(lecturerAllAssignmentsProvider.future);
  var count = 0;
  for (final assignment in assignments) {
    final summary = await ref
        .watch(lecturerAssignmentGradingSummaryProvider(assignment.id).future);
    count += summary.total - summary.graded;
  }
  return count;
});

/// Syllabus-progress heuristic for one course: share of published content
/// (materials, assignments, quizzes, exams) relative to a target of 8 items.
final lecturerCourseProgressProvider = FutureProvider.family<double, String>(
  (ref, courseId) async {
    final materials = await ref
        .watch(lecturerMaterialsForCourseProvider(courseId).future);
    final assignments = await ref
        .watch(lecturerAssignmentsForCourseProvider(courseId).future);
    final quizzes = await ref
        .watch(lecturerQuizzesForCourseProvider(courseId).future);
    final exams =
        await ref.watch(lecturerExamsForCourseProvider(courseId).future);
    final count = materials.length + assignments.length + quizzes.length + exams.length;
    return (count / 8).clamp(0.0, 1.0);
  },
);

/// Lecturer-facing performance snapshot for one course.
final lecturerCoursePerformanceProvider =
    FutureProvider.family<ApiCoursePerformance, String>(
  (ref, courseId) =>
      ref.watch(apiPerformanceRepositoryProvider).coursePerformance(courseId),
);

/// Announcements for one taught course, filtered from the school-wide feed.
final lecturerAnnouncementsForCourseProvider =
    FutureProvider.family<List<ApiAnnouncement>, String>(
  (ref, courseId) async {
    final page = await ref.watch(apiAnnouncementRepositoryProvider).list();
    return page.items.where((a) => a.courseId == courseId).toList();
  },
);
