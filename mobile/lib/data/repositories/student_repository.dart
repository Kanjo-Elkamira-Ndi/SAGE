import '../models/student.dart';

abstract class StudentRepository {
  List<StudentCourse> getCourses();
  StudentCourse courseById(String id);
  List<Assignment> getAssignments();
  Assignment assignmentById(String id);
  List<Quiz> getQuizzes();
  Quiz quizById(String id);
  List<AppNotification> getNotifications();
}
