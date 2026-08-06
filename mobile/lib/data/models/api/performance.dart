/// API-driven student performance models. Mirror the `GET /performance/me`
/// and `GET /performance/me/risk` responses (`api-wiring-plan.md` Appendix B).
library;

/// Per-course performance row from `metrics.byCourse`.
class ApiCourseMetric {
  const ApiCourseMetric({
    required this.id,
    required this.code,
    required this.title,
    this.coursePct,
    this.avgAssignmentPct,
    this.avgQuizPct,
    this.assignmentCount = 0,
    this.submittedCount = 0,
    this.gradedCount = 0,
    this.missedSubmissionRate = 0,
  });

  final String id;
  final String code;
  final String title;
  final double? coursePct;
  final double? avgAssignmentPct;
  final double? avgQuizPct;
  final int assignmentCount;
  final int submittedCount;
  final int gradedCount;
  final double missedSubmissionRate;

  factory ApiCourseMetric.fromJson(Map<String, dynamic> json) {
    return ApiCourseMetric(
      id: json['id'] as String,
      code: json['code'] as String,
      title: json['title'] as String,
      coursePct: (json['coursePct'] as num?)?.toDouble(),
      avgAssignmentPct: (json['avgAssignmentPct'] as num?)?.toDouble(),
      avgQuizPct: (json['avgQuizPct'] as num?)?.toDouble(),
      assignmentCount: (json['assignmentCount'] as num?)?.toInt() ?? 0,
      submittedCount: (json['submittedCount'] as num?)?.toInt() ?? 0,
      gradedCount: (json['gradedCount'] as num?)?.toInt() ?? 0,
      missedSubmissionRate: (json['missedSubmissionRate'] as num?)?.toDouble() ?? 0,
    );
  }
}

/// Aggregate student metrics (`metrics`).
class ApiPerformanceMetrics {
  const ApiPerformanceMetrics({
    this.gpa,
    this.avgAssignmentPct,
    this.avgQuizPct,
    this.missedSubmissionRate = 0,
    this.byCourse = const [],
  });

  final double? gpa;
  final double? avgAssignmentPct;
  final double? avgQuizPct;
  final double missedSubmissionRate;
  final List<ApiCourseMetric> byCourse;

  factory ApiPerformanceMetrics.fromJson(Map<String, dynamic> json) {
    return ApiPerformanceMetrics(
      gpa: (json['gpa'] as num?)?.toDouble(),
      avgAssignmentPct: (json['avgAssignmentPct'] as num?)?.toDouble(),
      avgQuizPct: (json['avgQuizPct'] as num?)?.toDouble(),
      missedSubmissionRate: (json['missedSubmissionRate'] as num?)?.toDouble() ?? 0,
      byCourse: (json['byCourse'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ApiCourseMetric.fromJson)
          .toList(),
    );
  }
}

/// Overall response of `GET /performance/me` (`{ overall: { snapshot, metrics } }`).
class ApiStudentPerformance {
  const ApiStudentPerformance({required this.metrics});

  final ApiPerformanceMetrics metrics;

  factory ApiStudentPerformance.fromJson(Map<String, dynamic> json) {
    final overall = json['overall'] as Map<String, dynamic>? ?? const {};
    return ApiStudentPerformance(
      metrics: ApiPerformanceMetrics.fromJson(
        overall['metrics'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}

/// Lecturer-facing course performance from `GET /performance/courses/:id`.
class ApiCoursePerformance {
  const ApiCoursePerformance({
    required this.course,
    required this.averages,
    required this.students,
  });

  final ApiCoursePerformanceCourse course;
  final ApiCoursePerformanceAverages averages;
  final List<ApiCoursePerformanceStudent> students;

  factory ApiCoursePerformance.fromJson(Map<String, dynamic> json) {
    return ApiCoursePerformance(
      course: ApiCoursePerformanceCourse.fromJson(
        json['course'] as Map<String, dynamic>? ?? const {},
      ),
      averages: ApiCoursePerformanceAverages.fromJson(
        json['averages'] as Map<String, dynamic>? ?? const {},
      ),
      students: (json['students'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ApiCoursePerformanceStudent.fromJson)
          .toList(),
    );
  }
}

class ApiCoursePerformanceCourse {
  const ApiCoursePerformanceCourse({
    required this.id,
    required this.code,
    required this.title,
  });

  final String id;
  final String code;
  final String title;

  factory ApiCoursePerformanceCourse.fromJson(Map<String, dynamic> json) {
    return ApiCoursePerformanceCourse(
      id: json['id'] as String? ?? '',
      code: json['code'] as String? ?? '',
      title: json['title'] as String? ?? '',
    );
  }
}

class ApiCoursePerformanceAverages {
  const ApiCoursePerformanceAverages({
    this.avgAssignmentPct,
    this.avgQuizPct,
    this.missedSubmissionRate = 0,
  });

  final double? avgAssignmentPct;
  final double? avgQuizPct;
  final double missedSubmissionRate;

  factory ApiCoursePerformanceAverages.fromJson(Map<String, dynamic> json) {
    return ApiCoursePerformanceAverages(
      avgAssignmentPct: (json['avgAssignmentPct'] as num?)?.toDouble(),
      avgQuizPct: (json['avgQuizPct'] as num?)?.toDouble(),
      missedSubmissionRate:
          (json['missedSubmissionRate'] as num?)?.toDouble() ?? 0,
    );
  }
}

class ApiCoursePerformanceStudent {
  const ApiCoursePerformanceStudent({
    required this.studentId,
    required this.name,
    required this.email,
    this.gpa,
    this.avgAssignmentPct,
    this.avgQuizPct,
    this.riskScore = 0,
    this.riskLevel = 'low',
  });

  final String studentId;
  final String name;
  final String email;
  final double? gpa;
  final double? avgAssignmentPct;
  final double? avgQuizPct;
  final double riskScore;

  /// `low`, `medium`, or `high`.
  final String riskLevel;

  factory ApiCoursePerformanceStudent.fromJson(Map<String, dynamic> json) {
    return ApiCoursePerformanceStudent(
      studentId: json['studentId'] as String,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      gpa: (json['gpa'] as num?)?.toDouble(),
      avgAssignmentPct: (json['avgAssignmentPct'] as num?)?.toDouble(),
      avgQuizPct: (json['avgQuizPct'] as num?)?.toDouble(),
      riskScore: (json['riskScore'] as num?)?.toDouble() ?? 0,
      riskLevel: json['riskLevel'] as String? ?? 'low',
    );
  }
}

/// At-risk breakdown from `GET /performance/me/risk`.
class ApiRiskDetail {
  const ApiRiskDetail({
    this.score = 0,
    this.level = 'low',
    this.gpaDecline = 0,
    this.missedSubmissionRate = 0,
    this.quizDecline = 0,
    this.lowEngagement = 0,
    this.reasons = const [],
    this.lastSnapshotDate,
  });

  final double score;

  /// `low`, `medium`, or `high`.
  final String level;
  final double gpaDecline;
  final double missedSubmissionRate;
  final double quizDecline;
  final double lowEngagement;
  final List<String> reasons;
  final DateTime? lastSnapshotDate;

  factory ApiRiskDetail.fromJson(Map<String, dynamic> json) {
    return ApiRiskDetail(
      score: (json['score'] as num?)?.toDouble() ?? 0,
      level: json['level'] as String? ?? 'low',
      gpaDecline: (json['gpaDecline'] as num?)?.toDouble() ?? 0,
      missedSubmissionRate:
          (json['missedSubmissionRate'] as num?)?.toDouble() ?? 0,
      quizDecline: (json['quizDecline'] as num?)?.toDouble() ?? 0,
      lowEngagement: (json['lowEngagement'] as num?)?.toDouble() ?? 0,
      reasons: (json['reasons'] as List<dynamic>? ?? const [])
          .whereType<String>()
          .toList(),
      lastSnapshotDate: json['lastSnapshotDate'] is String
          ? DateTime.tryParse(json['lastSnapshotDate'] as String)
          : null,
    );
  }
}
