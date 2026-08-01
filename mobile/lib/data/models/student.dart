/// Student domain models. Fields mirror the camelCase JSON contracts in
/// `docs/api-reference.md` so the mock → API swap (Phase 6) is mechanical.
library;

/// A course the student is enrolled in.
class StudentCourse {
  const StudentCourse({
    required this.id,
    required this.code,
    required this.name,
    required this.instructor,
    required this.progress,
    this.description,
    this.grade,
    this.attendance = 0,
    this.assignmentsProgress = 0,
    this.modules = const [],
    this.feed = const [],
    this.assignments = const [],
  });

  final String id;
  final String code;
  final String name;
  final String instructor;

  /// Syllabus completion 0.0–1.0.
  final double progress;
  final String? description;
  final String? grade;
  final double attendance;
  final double assignmentsProgress;
  final List<CourseModule> modules;
  final List<CourseFeedItem> feed;
  final List<Assignment> assignments;
}

/// A syllabus module inside a course (accordion row on course detail).
class CourseModule {
  const CourseModule({
    required this.title,
    required this.number,
    this.locked = false,
    this.unlockText,
    this.items = const [],
  });

  final String title;
  final String number;
  final bool locked;
  final String? unlockText;
  final List<CourseMaterial> items;
}

/// A single material item inside a module.
class CourseMaterial {
  const CourseMaterial({required this.title, required this.type});

  final String title;

  /// `description`, `play_circle` (video), `code`, …
  final String type;
}

/// A post on the course feed.
class CourseFeedItem {
  const CourseFeedItem({
    required this.title,
    required this.time,
    required this.body,
    this.accent = 'primary',
  });

  final String title;
  final String time;
  final String body;

  /// `primary` or `secondary`.
  final String accent;
}

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
}

/// A quiz question with options (A..D).
class QuizQuestion {
  const QuizQuestion({
    required this.text,
    required this.options,
    required this.answerIndex,
    this.figureCaption,
  });

  final String text;
  final List<String> options;
  final int answerIndex;
  final String? figureCaption;
}

/// In-app notification.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.time,
    required this.body,
    required this.category,
    required this.unread,
    this.actionLabel,
  });

  final String id;
  final String title;
  final String time;
  final String body;

  /// `grade`, `deadline`, `material`, `announcement`.
  final String category;
  final bool unread;
  final String? actionLabel;
}
