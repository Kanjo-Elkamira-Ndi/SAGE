import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/lecturer.dart';
import '../../data/models/student.dart';
import '../../data/repositories/lecturer_repository.dart';
import '../../data/repositories/mock/mock_lecturer_repository.dart';

/// Lecturer data binding — the single swap point for the Phase 6 API.
final lecturerRepositoryProvider = Provider<LecturerRepository>(
  (ref) => MockLecturerRepository(),
);

/// Thin read-only controller exposing seeded lecturer data to widgets.
class LecturerController extends Notifier<List<Object?>> {
  @override
  List<Object?> build() => const [];

  LecturerRepository get _repo => ref.read(lecturerRepositoryProvider);

  List<LecturerCourse> get courses => _repo.getCourses();

  LecturerCourse courseById(String id) => _repo.courseById(id);

  List<LecturerAssignment> get assignments => _repo.getAssignments();

  LecturerAssignment assignmentById(String id) => _repo.assignmentById(id);

  List<Submission> getSubmissions(String assignmentId) =>
      _repo.getSubmissions(assignmentId);

  List<LecturerQuiz> get quizzes => _repo.getQuizzes();

  List<DraftQuestion> get draftQuestions => _repo.getDraftQuestions();

  List<AtRiskStudent> get atRiskStudents => _repo.getAtRiskStudents();

  List<AttendancePoint> get attendanceTrend => _repo.getAttendanceTrend();

  List<AppNotification> get notifications => _repo.getNotifications();
}

final lecturerControllerProvider =
    NotifierProvider<LecturerController, List<Object?>>(LecturerController.new);
