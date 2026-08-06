import '../../../core/api_client.dart';
import '../../models/api/quiz.dart';

/// Quiz endpoints (`api-wiring-plan.md` A.2 / A.3): list per course,
/// create/update, start/submit attempts, results, and AI generation.
class ApiQuizRepository {
  ApiQuizRepository({required this.client});

  final ApiClient client;

  /// `GET /courses/:id/quizzes` → `data: { courseId, quizzes }`.
  Future<List<ApiQuiz>> listForCourse(String courseId) async {
    final data = await client.get('/courses/$courseId/quizzes');
    final json = data as Map<String, dynamic>;
    return (json['quizzes'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ApiQuiz.fromJson)
        .toList();
  }

  /// `POST /quizzes` (lecturer only).
  Future<ApiQuiz> create({
    required String courseId,
    required String title,
    required List<Map<String, dynamic>> questions,
    int? timeLimitMinutes,
    DateTime? availableFrom,
    DateTime? availableUntil,
    bool aiGenerated = false,
  }) async {
    final data = await client.post('/quizzes', body: {
      'courseId': courseId,
      'title': title,
      'timeLimitMinutes': timeLimitMinutes,
      'availableFrom': availableFrom?.toUtc().toIso8601String(),
      'availableUntil': availableUntil?.toUtc().toIso8601String(),
      'questions': questions,
      'aiGenerated': aiGenerated,
    });
    return ApiQuiz.fromJson(
      (data as Map<String, dynamic>)['quiz'] as Map<String, dynamic>,
    );
  }

  /// `POST /quizzes/:id/start` (student only).
  Future<ApiQuizAttempt> start(String quizId) async {
    final data = await client.post('/quizzes/$quizId/start');
    final json = data as Map<String, dynamic>;
    return ApiQuizAttempt(
      attemptId: json['attemptId'] as String,
      startedAt:
          DateTime.tryParse(json['startedAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      timeLimitMinutes: (json['timeLimitMinutes'] as num?)?.toInt(),
      questions: (json['questions'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(
            (q) => ApiAttemptQuestion(
              id: q['id'] as String,
              questionText: q['questionText'] as String,
              questionType: q['questionType'] as String? ?? 'mcq',
              options:
                  (q['options'] as List<dynamic>?)?.whereType<String>().toList(),
              points: (q['points'] as num?)?.toInt() ?? 1,
            ),
          )
          .toList(),
    );
  }

  /// `POST /quizzes/:id/submit` (student only) — body `{ answers: [{ questionId, answer }] }`.
  Future<ApiQuizResult> submit(
    String quizId, {
    required List<Map<String, dynamic>> answers,
  }) async {
    final data = await client.post('/quizzes/$quizId/submit', body: {
      'answers': answers,
    });
    return ApiQuizResult.fromJson(data as Map<String, dynamic>);
  }

  /// `GET /quizzes/:id/results` (student only, reopen review).
  Future<ApiQuizResultsDetail> results(String quizId) async {
    final data = await client.get('/quizzes/$quizId/results');
    return ApiQuizResultsDetail.fromJson(data as Map<String, dynamic>);
  }

  /// `POST /quizzes/generate` (lecturer only, rate-limited 6/min) →
  /// `data: { questions: [...] }` draft payload.
  Future<List<Map<String, dynamic>>> generate({
    required String courseId,
    String? materialId,
    int? numQuestions,
  }) async {
    final data = await client.post('/quizzes/generate', body: {
      'courseId': courseId,
      'materialId': materialId,
      'numQuestions': numQuestions,
    });
    final json = data as Map<String, dynamic>;
    return (json['questions'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .toList();
  }
}
