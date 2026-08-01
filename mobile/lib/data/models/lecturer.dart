/// Lecturer domain models. Fields mirror the camelCase JSON contracts in
/// `docs/api-reference.md` so the mock → API swap (Phase 6) is mechanical.
library;

/// A course owned by the lecturer, with the management-panel details.
class LecturerCourse {
  const LecturerCourse({
    required this.id,
    required this.code,
    required this.name,
    required this.semester,
    required this.level,
    required this.studentsEnrolled,
    required this.syllabusCompletion,
    this.avgAttendance,
    this.nextLecture,
    this.lectureHall,
    this.resources = const [],
    this.sessions = const [],
    this.announcements = const [],
  });

  final String id;
  final String code;
  final String name;

  /// e.g. "Fall 2024".
  final String semester;

  /// `Undergraduate` or `Postgraduate`.
  final String level;
  final int studentsEnrolled;

  /// Syllabus completion 0.0–1.0.
  final double syllabusCompletion;
  final double? avgAttendance;

  /// e.g. "Today, 14:00".
  final String? nextLecture;
  final String? lectureHall;
  final List<CourseResource> resources;
  final List<SessionDay> sessions;
  final List<CourseAnnouncement> announcements;
}

/// A resource row on the course management screen (folder / file / link).
class CourseResource {
  const CourseResource({
    required this.title,
    required this.subtitle,
    required this.type,
    this.uploaded,
  });

  final String title;
  final String subtitle;

  /// `folder`, `pdf`, or `link`.
  final String type;
  final DateTime? uploaded;
}

/// A past session with attendance (Recent Activity on course management).
class SessionDay {
  const SessionDay({required this.date, required this.attended});

  final String date;
  final int attended;
}

/// An announcement posted to the course.
class CourseAnnouncement {
  const CourseAnnouncement({
    required this.author,
    required this.initials,
    required this.time,
    required this.title,
    required this.body,
    required this.views,
    required this.comments,
  });

  final String author;
  final String initials;
  final String time;
  final String title;
  final String body;
  final int views;
  final int comments;
}

/// Grading progress state for a lecturer's assignment.
enum LecturerAssignmentStatus { grading, active, closed }

/// An assignment the lecturer created, with grading progress.
class LecturerAssignment {
  const LecturerAssignment({
    required this.id,
    required this.code,
    required this.title,
    required this.subtitle,
    required this.totalSubmissions,
    required this.gradedCount,
    required this.status,
    this.dueLabel,
  });

  final String id;
  final String code;
  final String title;
  final String subtitle;
  final int totalSubmissions;
  final int gradedCount;
  final LecturerAssignmentStatus status;
  final String? dueLabel;

  int get pendingCount => totalSubmissions - gradedCount;

  /// 0.0–1.0 fraction of submissions already graded.
  double get gradedFraction =>
      totalSubmissions == 0 ? 0 : gradedCount / totalSubmissions;
}

/// Submission delivery state in the grading queue.
enum SubmissionStatus { submitted, late, graded }

/// A single student submission waiting to be graded.
class Submission {
  const Submission({
    required this.id,
    required this.studentName,
    required this.initials,
    required this.meta,
    required this.status,
    this.score,
  });

  final String id;
  final String studentName;
  final String initials;

  /// e.g. "Submitted Oct 12, 09:45 AM", "Late (2h 15m)", "Graded Oct 11".
  final String meta;
  final SubmissionStatus status;

  /// Score out of 100 when graded.
  final int? score;
}

/// Quiz management row for the lecturer.
class LecturerQuiz {
  const LecturerQuiz({
    required this.id,
    required this.courseCode,
    required this.title,
    required this.questionCount,
    required this.durationMins,
    required this.status,
    this.section,
    this.students,
    this.classAverage,
    this.highestScore,
    this.completionRate,
    this.badge,
  });

  final String id;
  final String courseCode;
  final String title;
  final int questionCount;
  final int durationMins;

  /// `active`, `upcoming`, or `completed`.
  final String status;
  final String? section;
  final int? students;
  final double? classAverage;
  final double? highestScore;
  final double? completionRate;
  final String? badge;
}

/// One bar of the grade distribution chart.
class GradeDistribution {
  const GradeDistribution({required this.grade, required this.count});

  final String grade;
  final int count;
}

/// A question flagged as hardest on the quiz analytics screen.
class HardestQuestion {
  const HardestQuestion({
    required this.number,
    required this.successRate,
    required this.text,
  });

  final String number;
  final int successRate;
  final String text;
}

/// Draft question produced by the AI quiz creator.
class DraftQuestion {
  const DraftQuestion({
    required this.text,
    required this.options,
    this.answerIndex,
  });

  final String text;

  /// Empty for open-ended questions.
  final List<String> options;
  final int? answerIndex;

  bool get isOpenEnded => options.isEmpty;
}

/// A row in the at-risk students list.
class AtRiskStudent {
  const AtRiskStudent({required this.name, required this.reason});

  final String name;
  final String reason;
}

/// Attendance trend point (0.0–1.0) for the course performance chart.
class AttendancePoint {
  const AttendancePoint(this.day, this.value);

  final String day;
  final double value;
}
