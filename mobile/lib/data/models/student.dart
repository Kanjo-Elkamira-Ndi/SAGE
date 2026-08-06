/// Student display models: lightweight UI wrappers over the API rows from
/// `docs/api-wiring-plan.md` Appendix A. The heavy domain models
/// (`StudentCourse`, `CourseModule`, `AppNotification`, …) were removed with
/// the mock layer.
library;

import 'api/assignment.dart';
import 'api/quiz.dart';

/// Assignment status → drives the badge + icon + urgency color.
enum AssignmentStatus { overdue, dueSoon, pending, submitted, graded }

class Assignment {
  const Assignment({
    required this.id,
    required this.title,
    required this.description,
    required this.courseCode,
    required this.points,
    required this.status,
    this.dueLabel,
    this.completedLabel,
  });

  final String id;
  final String title;
  final String description;
  final String courseCode;
  final int points;
  final AssignmentStatus status;

  /// e.g. "Oct 24, 2023" or "Tomorrow".
  final String? dueLabel;

  /// e.g. "Completed (94%)".
  final String? completedLabel;

  /// Maps an API assignment row into the display model. `courseCode` is the
  /// owning course's code (the API rows only carry `courseId`).
  factory Assignment.fromApi(ApiAssignment api, {required String courseCode}) {
    final now = DateTime.now();
    final mine = api.mySubmission;
    final status = switch ((mine, now.isAfter(api.deadlineAt))) {
      (final m?, _) when m.graded => AssignmentStatus.graded,
      (final _, _) when mine != null => AssignmentStatus.submitted,
      (null, true) => AssignmentStatus.overdue,
      (null, false) when api.deadlineAt.difference(now).inHours <= 24 =>
        AssignmentStatus.dueSoon,
      _ => AssignmentStatus.pending,
    };
    return Assignment(
      id: api.id,
      title: api.title,
      description: api.instructions ?? '',
      courseCode: courseCode,
      points: api.maxScore,
      status: status,
      dueLabel: status == AssignmentStatus.graded ||
              status == AssignmentStatus.submitted
          ? null
          : api.dueLabel,
      completedLabel: switch (mine) {
        final m? when m.graded =>
          'Completed · ${m.score ?? 0}%',
        final _? => 'Submitted · Pending grade',
        null => null,
      },
    );
  }
}

/// Quiz availability → drives badge + button.
enum QuizStatus { active, upcoming, locked, completed }

class Quiz {
  const Quiz({
    required this.id,
    required this.course,
    required this.title,
    required this.durationMins,
    required this.questionCount,
    required this.status,
    this.badge,
    this.footnote,
    this.buttonLabel,
    this.score,
  });

  final String id;
  final String course;
  final String title;
  final int durationMins;
  final int questionCount;
  final QuizStatus status;

  /// e.g. "Due in 2 hours", "Scored: 92%", "Next Week".
  final String? badge;
  final String? footnote;
  final String? buttonLabel;

  /// Completed score 0–100.
  final int? score;

  /// Maps an API quiz row into the display model. `course` is the owning
  /// course's code (the API rows only carry `courseId`).
  factory Quiz.fromApi(ApiQuiz api, {required String course}) {
    final now = DateTime.now();
    final from = api.availableFrom;
    final until = api.availableUntil;
    final completed = api.myBestScore != null;
    final status = completed
        ? QuizStatus.completed
        : from != null && now.isBefore(from)
            ? QuizStatus.upcoming
            : until != null && now.isAfter(until)
                ? QuizStatus.locked
                : QuizStatus.active;
    return Quiz(
      id: api.id,
      course: course,
      title: api.title,
      durationMins: api.durationMins,
      questionCount: api.questionCount,
      status: status,
      badge: completed
          ? 'Scored: ${api.myBestScore}%'
          : switch (status) {
              QuizStatus.upcoming => 'Upcoming',
              QuizStatus.locked => 'Closed',
              _ => 'Available now',
            },
      footnote:
          '${api.questionCount} questions \u00b7 ${api.durationMins} min',
      buttonLabel: completed
          ? 'Review Answers'
          : status == QuizStatus.active
              ? 'Start Quiz'
              : 'Open',
      score: api.myBestScore,
    );
  }
}
