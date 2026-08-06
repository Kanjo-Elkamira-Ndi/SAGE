/// API-driven course model. Mirrors the course row returned by the Express
/// API (`GET /courses`, `GET /courses/:id`) — camelCase JSON, envelope-free
/// (`api-wiring-plan.md` Appendix B).
class ApiCourse {
  const ApiCourse({
    required this.id,
    required this.code,
    required this.title,
    required this.lecturerName,
    this.description,
    this.semester,
    this.creditUnits,
    this.departmentName,
    this.outline,
    this.enrolledCount = 0,
  });

  final String id;
  final String code;
  final String title;
  final String lecturerName;
  final String? description;
  final String? semester;
  final int? creditUnits;
  final String? departmentName;
  final String? outline;
  final int enrolledCount;

  factory ApiCourse.fromJson(Map<String, dynamic> json) {
    return ApiCourse(
      id: json['id'] as String,
      code: json['code'] as String,
      title: json['title'] as String,
      lecturerName: json['lecturerName'] as String,
      description: json['description'] as String?,
      semester: json['semester'] as String?,
      creditUnits: (json['creditUnits'] as num?)?.toInt(),
      departmentName: json['departmentName'] as String?,
      outline: json['outline'] as String?,
      enrolledCount: (json['enrolledCount'] as num?)?.toInt() ?? 0,
    );
  }
}
