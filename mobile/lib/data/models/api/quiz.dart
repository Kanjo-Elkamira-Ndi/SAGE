/// API-driven quiz models. Mirror `QuizRow` / `QuestionRow` and the
/// start / submit / results responses (`api-wiring-plan.md` Appendix A).
library;

/// Quiz row from `GET /courses/:id/quizzes` (student rows include
/// `myBestScore`).
class ApiQuiz {
  const ApiQuiz({
    required this.id,
    required this.courseId,
    required this.createdBy,
    required this.title,
    required this.aiGenerated,
    required this.questionCount,
    required this.createdAt,
    this.timeLimitMinutes,
    this.availableFrom,
    this.availableUntil,
    this.myBestScore,
    this.updatedAt,
  });

  final String id;
  final String courseId;
  final String createdBy;
  final String title;
  final int? timeLimitMinutes;
  final DateTime? availableFrom;
  final DateTime? availableUntil;
  final bool aiGenerated;
  final int questionCount;
  final int? myBestScore;
  final DateTime createdAt;
  final DateTime? updatedAt;

  int get durationMins => timeLimitMinutes ?? 0;

  bool get isCompleted => myBestScore != null;

  factory ApiQuiz.fromJson(Map<String, dynamic> json) {
    return ApiQuiz(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      createdBy: json['createdBy'] as String,
      title: json['title'] as String,
      timeLimitMinutes: (json['timeLimitMinutes'] as num?)?.toInt(),
      availableFrom: json['availableFrom'] is String
          ? DateTime.tryParse(json['availableFrom'] as String)?.toLocal()
          : null,
      availableUntil: json['availableUntil'] is String
          ? DateTime.tryParse(json['availableUntil'] as String)?.toLocal()
          : null,
      aiGenerated: json['aiGenerated'] as bool? ?? false,
      questionCount: (json['questionCount'] as num?)?.toInt() ?? 0,
      myBestScore: (json['myBestScore'] as num?)?.toInt(),
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      updatedAt: json['updatedAt'] is String
          ? DateTime.tryParse(json['updatedAt'] as String)?.toLocal()
          : null,
    );
  }
}

/// A question as exposed during an attempt (`POST /quizzes/:id/start`) —
/// no correct answer until submit/results.
class ApiAttemptQuestion {
  const ApiAttemptQuestion({
    required this.id,
    required this.questionText,
    required this.questionType,
    required this.points,
    this.options,
  });

  final String id;
  final String questionText;

  /// `mcq` or `true_false`.
  final String questionType;
  final List<String>? options;
  final int points;
}

/// `POST /quizzes/:id/start` → `data`.
class ApiQuizAttempt {
  const ApiQuizAttempt({
    required this.attemptId,
    required this.startedAt,
    required this.questions,
    this.timeLimitMinutes,
  });

  final String attemptId;
  final DateTime startedAt;
  final int? timeLimitMinutes;
  final List<ApiAttemptQuestion> questions;
}

/// One graded question in the submit / results payload.
class ApiQuizAnswerResult {
  const ApiQuizAnswerResult({
    required this.questionId,
    required this.correct,
    required this.yourAnswer,
    required this.correctAnswer,
    required this.points,
  });

  final String questionId;
  final bool correct;
  final String yourAnswer;
  final String correctAnswer;
  final int points;

  factory ApiQuizAnswerResult.fromJson(Map<String, dynamic> json) {
    return ApiQuizAnswerResult(
      questionId: json['questionId'] as String,
      correct: json['correct'] as bool? ?? false,
      yourAnswer: json['yourAnswer'] as String? ?? '',
      correctAnswer: json['correctAnswer'] as String? ?? '',
      points: (json['points'] as num?)?.toInt() ?? 0,
    );
  }
}

/// `POST /quizzes/:id/submit` → `data` (immediate auto-graded result).
class ApiQuizResult {
  const ApiQuizResult({
    required this.attemptId,
    required this.score,
    required this.total,
    required this.correctCount,
    required this.questionCount,
    required this.timeUsedSeconds,
    required this.results,
  });

  final String attemptId;
  final int score;
  final int total;
  final int correctCount;
  final int questionCount;
  final int timeUsedSeconds;
  final List<ApiQuizAnswerResult> results;

  factory ApiQuizResult.fromJson(Map<String, dynamic> json) {
    return ApiQuizResult(
      attemptId: json['attemptId'] as String,
      score: (json['score'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      correctCount: (json['correctCount'] as num?)?.toInt() ?? 0,
      questionCount: (json['questionCount'] as num?)?.toInt() ?? 0,
      timeUsedSeconds: (json['timeUsedSeconds'] as num?)?.toInt() ?? 0,
      results: (json['results'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ApiQuizAnswerResult.fromJson)
          .toList(),
    );
  }
}

/// `GET /quizzes/:id/results` → `data` (full review on reopen).
class ApiQuizResultsDetail {
  const ApiQuizResultsDetail({
    required this.quizId,
    required this.title,
    required this.attemptId,
    required this.startedAt,
    required this.submittedAt,
    required this.score,
    required this.total,
    required this.correctCount,
    required this.questionCount,
    required this.timeUsedSeconds,
    required this.questions,
  });

  final String quizId;
  final String title;
  final String attemptId;
  final DateTime startedAt;
  final DateTime submittedAt;
  final int score;
  final int total;
  final int correctCount;
  final int questionCount;
  final int timeUsedSeconds;
  final List<ApiQuizReviewQuestion> questions;

  factory ApiQuizResultsDetail.fromJson(Map<String, dynamic> json) {
    return ApiQuizResultsDetail(
      quizId: json['quizId'] as String,
      title: json['title'] as String,
      attemptId: json['attemptId'] as String,
      startedAt: DateTime.tryParse(json['startedAt'] as String? ?? '')?.toLocal() ??
          DateTime.now(),
      submittedAt: DateTime.tryParse(json['submittedAt'] as String? ?? '')
              ?.toLocal() ??
          DateTime.now(),
      score: (json['score'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      correctCount: (json['correctCount'] as num?)?.toInt() ?? 0,
      questionCount: (json['questionCount'] as num?)?.toInt() ?? 0,
      timeUsedSeconds: (json['timeUsedSeconds'] as num?)?.toInt() ?? 0,
      questions: (json['questions'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ApiQuizReviewQuestion.fromJson)
          .toList(),
    );
  }
}

/// A reviewed question with the student's answer (results detail).
class ApiQuizReviewQuestion {
  const ApiQuizReviewQuestion({
    required this.id,
    required this.questionText,
    required this.questionType,
    required this.points,
    required this.correctAnswer,
    required this.yourAnswer,
    required this.correct,
    this.options,
  });

  final String id;
  final String questionText;
  final String questionType;
  final List<String>? options;
  final int points;
  final String correctAnswer;
  final String yourAnswer;
  final bool correct;

  factory ApiQuizReviewQuestion.fromJson(Map<String, dynamic> json) {
    return ApiQuizReviewQuestion(
      id: json['id'] as String,
      questionText: json['questionText'] as String,
      questionType: json['questionType'] as String? ?? 'mcq',
      options: (json['options'] as List<dynamic>?)
          ?.whereType<String>()
          .toList(),
      points: (json['points'] as num?)?.toInt() ?? 1,
      correctAnswer: json['correctAnswer'] as String? ?? '',
      yourAnswer: json['yourAnswer'] as String? ?? '',
      correct: json['correct'] as bool? ?? false,
    );
  }
}
