import '../models/lecturer.dart';
import '../models/student.dart';

abstract class LecturerRepository {
  List<LecturerCourse> getCourses();
  LecturerCourse courseById(String id);
  List<LecturerAssignment> getAssignments();
  LecturerAssignment assignmentById(String id);
  List<Submission> getSubmissions(String assignmentId);
  List<LecturerQuiz> getQuizzes();
  List<DraftQuestion> getDraftQuestions();
  List<AtRiskStudent> getAtRiskStudents();
  List<AttendancePoint> getAttendanceTrend();
  List<AppNotification> getNotifications();
}
