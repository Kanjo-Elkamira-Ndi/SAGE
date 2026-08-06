/// Typed API failures. Mirrors the API error contract from `api-reference.md`:
///
/// ```json
/// { "success": false, "error": { "code": "STRING_CODE", "message": "...", "details": { "fieldErrors": {} } } }
/// ```
library;

/// A non-2xx response from the SAGE API, carrying the machine-readable code.
class SageException implements Exception {
  const SageException({
    required this.code,
    required this.message,
    this.fieldErrors = const {},
    this.statusCode,
  });

  /// API error code, e.g. `AUTH_INVALID_CREDENTIALS`, `VALIDATION_ERROR`.
  final String code;
  final String message;

  /// `details.fieldErrors` from `VALIDATION_ERROR` responses (field → messages).
  final Map<String, List<String>> fieldErrors;

  /// HTTP status code when known (400, 401, 403, 404, 409, 429, 5xx).
  final int? statusCode;

  bool get isValidation => code == 'VALIDATION_ERROR';
  bool get isAuthExpired => code == 'AUTH_TOKEN_EXPIRED';
  bool get isRateLimited => code == 'TOO_MANY_REQUESTS';

  /// True when the session was reused/rotated on another client and every
  /// session was revoked (`AUTH_TOKEN_REUSED`). The app must sign out.
  bool get isReusedSession => code == 'AUTH_TOKEN_REUSED';

  @override
  String toString() => 'SageException($code): $message';
}

/// A transport-level failure: no connection, timeout, or invalid response.
/// Never shows a server `message` — always the local copy.
class SageNetworkException extends SageException {
  const SageNetworkException(String message)
      : super(code: 'NETWORK_ERROR', message: message);

  bool get isTimeout => message == _timeoutCopy;

  static const _timeoutCopy = 'Connection timed out. Please try again.';
}

/// The 401 refresh loop failed (refresh token invalid/expired) — the app
/// must wipe local state and send the user to login.
class SageSessionExpiredException extends SageException {
  const SageSessionExpiredException()
      : super(
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        );
}

/// Human-friendly copy for known error codes. Anything unknown falls back to
/// the server `message` (only for non-validation errors).
String sageErrorCopy(String code, String serverMessage) {
  return switch (code) {
    'AUTH_INVALID_CREDENTIALS' => 'Incorrect email or password.',
    'AUTH_TOKEN_EXPIRED' || 'SESSION_EXPIRED' =>
      'Your session has expired. Please sign in again.',
    'AUTH_TOKEN_REUSED' =>
      'You were signed out everywhere because your session was used on another device.',
    'USER_PENDING_APPROVAL' =>
      'Your account is awaiting approval by an administrator.',
    'USER_DEACTIVATED' =>
      'This account has been deactivated. Contact the administration.',
    'USER_NOT_FOUND' => 'User not found.',
    'FORBIDDEN_ROLE' => "You don't have permission to do that.",
    'NOT_ENROLLED' => 'You are not enrolled in this course.',
    'NOT_COURSE_OWNER' => "You can only change courses you own.",
    'NOT_FOUND' || 'COURSE_NOT_FOUND' => 'This item could not be found.',
    'ANNOUNCEMENT_NOT_FOUND' => 'Announcement not found.',
    'NOTIFICATION_NOT_FOUND' => 'Notification not found.',
    'DEADLINE_PAST' => 'Deadlines must be in the future.',
    'DEADLINE_PASSED' => 'The deadline for this assignment has passed.',
    'SCORE_EXCEEDS_MAX' => 'The score cannot be higher than the maximum.',
    'SUBMISSION_FILE_MISSING' =>
      'The submitted file was not found in storage. Please try again.',
    'QUIZ_NOT_AVAILABLE' => 'This quiz is not open yet.',
    'QUIZ_CLOSED' => 'This quiz has closed.',
    'QUIZ_ALREADY_ATTEMPTED' => 'You have already attempted this quiz.',
    'QUIZ_TIME_EXPIRED' => 'Time is up — your attempt was submitted.',
    'QUIZ_NOT_TAKEN' => 'Complete the quiz before viewing results.',
    'INVALID_QUESTION' => 'The submitted answers do not match this quiz.',
    'GROQ_UNAVAILABLE' =>
      'AI question generation is unavailable right now. Try again later.',
    'AI_OUTPUT_INVALID' =>
      'AI question generation returned an invalid result. Try again.',
    'MATERIAL_NOT_FOUND' =>
      'No course material available to generate questions from.',
    'MATERIAL_TEXT_EMPTY' =>
      'That material has no readable text to generate from.',
    'MATERIAL_TYPE_UNSUPPORTED' =>
      'That material type cannot be used for generation.',
    'PDF_PARSE_FAILED' => 'That PDF could not be read.',
    'DEPARTMENT_CODE_TAKEN' => 'A department with this code already exists.',
    'TOO_MANY_REQUESTS' =>
      'Too many attempts. Please wait a moment and try again.',
    'VALIDATION_ERROR' => serverMessage,
    _ => serverMessage,
  };
}
