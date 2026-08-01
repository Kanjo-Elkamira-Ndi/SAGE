import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/student.dart';
import '../../data/repositories/mock/mock_student_repository.dart';
import '../../data/repositories/student_repository.dart';

/// Student data binding — the single swap point for the Phase 6 API.
final studentRepositoryProvider = Provider<StudentRepository>(
  (ref) => MockStudentRepository(),
);

/// Thin read-only controller exposing seeded student data to widgets.
class StudentController extends Notifier<List<Object?>> {
  @override
  List<Object?> build() => const [];

  StudentRepository get _repo => ref.read(studentRepositoryProvider);

  List<StudentCourse> get courses => _repo.getCourses();

  StudentCourse courseById(String id) => _repo.courseById(id);

  List<Assignment> get assignments => _repo.getAssignments();

  Assignment assignmentById(String id) => _repo.assignmentById(id);

  List<Quiz> get quizzes => _repo.getQuizzes();

  Quiz quizById(String id) => _repo.quizById(id);

  List<AppNotification> get notifications => _repo.getNotifications();
}

final studentControllerProvider =
    NotifierProvider<StudentController, List<Object?>>(StudentController.new);
