/// API-driven assignment model. Mirrors `AssignmentRow` returned by
/// `GET /courses/:id/assignments`; student rows include `mySubmission`
/// (`api-wiring-plan.md` Appendix A).
class ApiAssignment {
  const ApiAssignment({
    required this.id,
    required this.courseId,
    required this.createdBy,
    required this.title,
    required this.maxScore,
    required this.deadlineAt,
    required this.allowLateSubmission,
    required this.createdAt,
    this.instructions,
    this.updatedAt,
    this.mySubmission,
  });

  final String id;
  final String courseId;
  final String createdBy;
  final String title;
  final String? instructions;
  final int maxScore;
  final DateTime deadlineAt;
  final bool allowLateSubmission;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final ApiMySubmission? mySubmission;

  /// Human deadline label, e.g. "Due Fri, 20 Jun · 23:59".
  String get dueLabel {
    final local = deadlineAt.toLocal();
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final two = local.minute.toString().padLeft(2, '0');
    return 'Due ${weekdays[local.weekday - 1]}, ${local.day} '
        '${months[local.month - 1]} \u00b7 ${local.hour}:$two';
  }

  factory ApiAssignment.fromJson(Map<String, dynamic> json) {
    final rawSubmission = json['mySubmission'];
    return ApiAssignment(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      createdBy: json['createdBy'] as String,
      title: json['title'] as String,
      instructions: json['instructions'] as String?,
      maxScore: (json['maxScore'] as num?)?.toInt() ?? 0,
      deadlineAt:
          DateTime.tryParse(json['deadlineAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      allowLateSubmission: json['allowLateSubmission'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      updatedAt: json['updatedAt'] is String
          ? DateTime.tryParse(json['updatedAt'] as String)?.toLocal()
          : null,
      mySubmission: rawSubmission is Map<String, dynamic>
          ? ApiMySubmission.fromJson(rawSubmission)
          : null,
    );
  }
}

/// The student's own submission embedded in an assignment row (`mySubmission`).
class ApiMySubmission {
  const ApiMySubmission({
    required this.submissionId,
    required this.submittedAt,
    required this.isLate,
    required this.graded,
    this.score,
  });

  final String submissionId;
  final DateTime submittedAt;
  final bool isLate;
  final int? score;
  final bool graded;

  factory ApiMySubmission.fromJson(Map<String, dynamic> json) {
    return ApiMySubmission(
      submissionId: json['submissionId'] as String,
      submittedAt:
          DateTime.tryParse(json['submittedAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      isLate: json['isLate'] as bool? ?? false,
      score: (json['score'] as num?)?.toInt(),
      graded: json['graded'] as bool? ?? false,
    );
  }
}

/// A student submission for a given assignment. Mirrors `SubmissionRow`
/// returned by `GET /assignments/:id/submissions`.
class ApiSubmission {
  const ApiSubmission({
    required this.id,
    required this.assignmentId,
    required this.studentId,
    required this.studentName,
    required this.studentEmail,
    required this.storageKey,
    required this.submittedAt,
    required this.isLate,
    required this.attempts,
    this.score,
    this.feedback,
    this.gradedBy,
    this.gradedAt,
  });

  final String id;
  final String assignmentId;
  final String studentId;
  final String studentName;
  final String studentEmail;
  final String storageKey;
  final DateTime submittedAt;
  final bool isLate;
  final int? score;
  final String? feedback;
  final String? gradedBy;
  final DateTime? gradedAt;
  final int attempts;

  String get initials {
    final parts = studentName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    final first = parts.first[0];
    final last = parts.length > 1 ? parts.last[0] : '';
    return (first + last).toUpperCase();
  }

  factory ApiSubmission.fromJson(Map<String, dynamic> json) {
    return ApiSubmission(
      id: json['id'] as String,
      assignmentId: json['assignmentId'] as String,
      studentId: json['studentId'] as String,
      studentName: json['studentName'] as String? ?? '',
      studentEmail: json['studentEmail'] as String? ?? '',
      storageKey: json['storageKey'] as String,
      submittedAt:
          DateTime.tryParse(json['submittedAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      isLate: json['isLate'] as bool? ?? false,
      score: (json['score'] as num?)?.toInt(),
      feedback: json['feedback'] as String?,
      gradedBy: json['gradedBy'] as String?,
      gradedAt: json['gradedAt'] is String
          ? DateTime.tryParse(json['gradedAt'] as String)?.toLocal()
          : null,
      attempts: (json['attempts'] as num?)?.toInt() ?? 1,
    );
  }
}
