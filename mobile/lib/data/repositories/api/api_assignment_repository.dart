import '../../../core/api_client.dart';
import '../../models/api/assignment.dart';
import '../../models/api/material.dart';

/// Assignment + submission endpoints (`api-wiring-plan.md` A.2 / A.3):
/// list per course, create/update, signed submission upload/finalize,
/// submissions list, grading, and signed download.
class ApiAssignmentRepository {
  ApiAssignmentRepository({required this.client});

  final ApiClient client;

  /// `GET /courses/:id/assignments` → `data: { courseId, assignments }`.
  Future<List<ApiAssignment>> listForCourse(String courseId) async {
    final data = await client.get('/courses/$courseId/assignments');
    final json = data as Map<String, dynamic>;
    return (json['assignments'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ApiAssignment.fromJson)
        .toList();
  }

  /// `POST /assignments` (lecturer only).
  Future<ApiAssignment> create({
    required String courseId,
    required String title,
    required DateTime deadlineAt,
    String? instructions,
    int? maxScore,
    bool? allowLateSubmission,
  }) async {
    final data = await client.post('/assignments', body: {
      'courseId': courseId,
      'title': title,
      'instructions': instructions,
      'maxScore': maxScore,
      'deadlineAt': deadlineAt.toUtc().toIso8601String(),
      'allowLateSubmission': allowLateSubmission,
    });
    return ApiAssignment.fromJson(
      (data as Map<String, dynamic>)['assignment'] as Map<String, dynamic>,
    );
  }

  /// `PATCH /assignments/:id` (lecturer only).
  Future<ApiAssignment> update(
    String id, {
    String? title,
    String? instructions,
    int? maxScore,
    DateTime? deadlineAt,
    bool? allowLateSubmission,
  }) async {
    final data = await client.patch('/assignments/$id', body: {
      'title': title,
      'instructions': instructions,
      'maxScore': maxScore,
      'deadlineAt': deadlineAt?.toUtc().toIso8601String(),
      'allowLateSubmission': allowLateSubmission,
    });
    return ApiAssignment.fromJson(
      (data as Map<String, dynamic>)['assignment'] as Map<String, dynamic>,
    );
  }

  /// `POST /submissions/upload-url` (student only).
  Future<ApiUploadUrl> submissionUploadUrl({
    required String assignmentId,
    required String fileName,
    required String contentType,
    required int fileSizeBytes,
  }) async {
    final data = await client.post('/submissions/upload-url', body: {
      'assignmentId': assignmentId,
      'fileName': fileName,
      'contentType': contentType,
      'fileSizeBytes': fileSizeBytes,
    });
    return ApiUploadUrl.fromJson(data as Map<String, dynamic>);
  }

  /// `POST /submissions` — finalize a finished upload (student only).
  Future<ApiSubmission> finalizeSubmission({
    required String assignmentId,
    required String storageKey,
  }) async {
    final data = await client.post('/submissions', body: {
      'assignmentId': assignmentId,
      'storageKey': storageKey,
    });
    return ApiSubmission.fromJson(
      (data as Map<String, dynamic>)['submission'] as Map<String, dynamic>,
    );
  }

  /// `GET /assignments/:id/submissions` (lecturer only) → `data: [...]`.
  Future<List<ApiSubmission>> listSubmissions(String assignmentId) async {
    final data = await client.get('/assignments/$assignmentId/submissions');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(ApiSubmission.fromJson)
        .toList();
  }

  /// `PATCH /submissions/:id/grade` (lecturer only).
  Future<ApiSubmission> grade(
    String submissionId, {
    required int score,
    String? feedback,
  }) async {
    final data = await client.patch('/submissions/$submissionId/grade', body: {
      'score': score,
      'feedback': feedback,
    });
    return ApiSubmission.fromJson(
      (data as Map<String, dynamic>)['submission'] as Map<String, dynamic>,
    );
  }

  /// `GET /submissions/:id/download-url` → short-lived signed URL.
  Future<String> submissionDownloadUrl(String submissionId) async {
    final data = await client.get('/submissions/$submissionId/download-url');
    return (data as Map<String, dynamic>)['downloadUrl'] as String;
  }
}
