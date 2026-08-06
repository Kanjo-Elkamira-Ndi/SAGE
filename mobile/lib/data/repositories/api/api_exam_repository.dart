import '../../../core/api_client.dart';
import '../../models/api/exam.dart';

/// Exam endpoints (`api-wiring-plan.md` A.3): list per course, create/update.
class ApiExamRepository {
  ApiExamRepository({required this.client});

  final ApiClient client;

  /// `GET /courses/:id/exams` → `data: { courseId, exams }`.
  Future<List<ApiExam>> listForCourse(String courseId) async {
    final data = await client.get('/courses/$courseId/exams');
    final json = data as Map<String, dynamic>;
    return (json['exams'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ApiExam.fromJson)
        .toList();
  }

  /// `POST /exams` (lecturer only).
  Future<ApiExam> create({
    required String courseId,
    required String title,
    required DateTime scheduledAt,
    int? durationMinutes,
    String? venue,
    String? instructions,
  }) async {
    final data = await client.post('/exams', body: {
      'courseId': courseId,
      'title': title,
      'scheduledAt': scheduledAt.toUtc().toIso8601String(),
      'durationMinutes': durationMinutes,
      'venue': venue,
      'instructions': instructions,
    });
    return ApiExam.fromJson(
      (data as Map<String, dynamic>)['exam'] as Map<String, dynamic>,
    );
  }

  /// `PATCH /exams/:id` (lecturer only).
  Future<ApiExam> update(
    String id, {
    String? title,
    DateTime? scheduledAt,
    int? durationMinutes,
    String? venue,
    String? instructions,
  }) async {
    final data = await client.patch('/exams/$id', body: {
      'title': title,
      'scheduledAt': scheduledAt?.toUtc().toIso8601String(),
      'durationMinutes': durationMinutes,
      'venue': venue,
      'instructions': instructions,
    });
    return ApiExam.fromJson(
      (data as Map<String, dynamic>)['exam'] as Map<String, dynamic>,
    );
  }
}
