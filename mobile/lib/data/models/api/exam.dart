/// API-driven exam model. Mirrors `ExamRow` returned by
/// `GET /courses/:id/exams` (`api-wiring-plan.md` Appendix A).
class ApiExam {
  const ApiExam({
    required this.id,
    required this.courseId,
    required this.createdBy,
    required this.title,
    required this.scheduledAt,
    required this.createdAt,
    this.durationMinutes,
    this.venue,
    this.instructions,
    this.updatedAt,
  });

  final String id;
  final String courseId;
  final String createdBy;
  final String title;
  final DateTime scheduledAt;
  final int? durationMinutes;
  final String? venue;
  final String? instructions;
  final DateTime createdAt;
  final DateTime? updatedAt;

  factory ApiExam.fromJson(Map<String, dynamic> json) {
    return ApiExam(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      createdBy: json['createdBy'] as String,
      title: json['title'] as String,
      scheduledAt:
          DateTime.tryParse(json['scheduledAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      durationMinutes: (json['durationMinutes'] as num?)?.toInt(),
      venue: json['venue'] as String?,
      instructions: json['instructions'] as String?,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      updatedAt: json['updatedAt'] is String
          ? DateTime.tryParse(json['updatedAt'] as String)?.toLocal()
          : null,
    );
  }
}
