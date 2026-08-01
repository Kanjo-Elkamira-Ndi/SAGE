import '../../models/lecturer.dart';
import '../../models/student.dart';
import '../lecturer_repository.dart';

/// In-memory lecturer data seeded from the SAGE lecturer app screens (Stitch
/// project 20116894548131772). Replaced by `/api/lecturer/*` in Phase 6.
class MockLecturerRepository implements LecturerRepository {
  MockLecturerRepository();

  static final courses = <LecturerCourse>[
    LecturerCourse(
      id: 'cs402',
      code: 'CS402',
      name: 'Software Architecture',
      semester: 'Fall 2024',
      level: 'Postgraduate',
      studentsEnrolled: 84,
      syllabusCompletion: 0.75,
      avgAttendance: 84,
      nextLecture: 'Today, 14:00',
      lectureHall: 'Hall B-12',
      resources: const [
        CourseResource(
          title: 'Lecture Slides',
          subtitle: '12 files \u00b7 Updated 2 days ago',
          type: 'folder',
        ),
        CourseResource(
          title: 'Syllabus_2024.pdf',
          subtitle: '1.2 MB \u00b7 Sep 10, 2024',
          type: 'pdf',
        ),
        CourseResource(
          title: 'Project Documentation',
          subtitle: 'External URL \u00b7 github.com/cs402',
          type: 'link',
        ),
      ],
      sessions: const [
        SessionDay(date: 'Oct 22, 2024', attended: 92),
        SessionDay(date: 'Oct 20, 2024', attended: 88),
      ],
      announcements: const [
        CourseAnnouncement(
          author: 'Dr. James Dalton',
          initials: 'JD',
          time: '2 hours ago',
          title: 'Midterm Exam Schedule',
          body:
              'Please be advised that the midterm exam has been moved to '
              'Hall C-4 to accommodate more space. Same time: 10:00 AM.',
          views: 142,
          comments: 8,
        ),
      ],
    ),
    LecturerCourse(
      id: 'cs302',
      code: 'CS-302',
      name: 'Advanced Algorithm Design',
      semester: 'Fall 2024',
      level: 'Postgraduate',
      studentsEnrolled: 128,
      syllabusCompletion: 0.75,
      avgAttendance: 92,
      nextLecture: 'Tomorrow, 10:00',
      lectureHall: 'Hall 3A',
      resources: const [
        CourseResource(
          title: 'Lectures & Notes',
          subtitle: '8 files \u00b7 Updated 1 week ago',
          type: 'folder',
        ),
      ],
      sessions: const [SessionDay(date: 'Oct 21, 2024', attended: 95)],
      announcements: const [],
    ),
    LecturerCourse(
      id: 'ds101',
      code: 'DS-101',
      name: 'Introduction to Data Science',
      semester: 'Fall 2024',
      level: 'Undergraduate',
      studentsEnrolled: 245,
      syllabusCompletion: 0.42,
      avgAttendance: 78,
      nextLecture: 'Thu, 09:00',
      lectureHall: 'Hall 7B, Floor 2',
      resources: const [
        CourseResource(
          title: 'Module Slides',
          subtitle: '15 files \u00b7 Updated 3 days ago',
          type: 'folder',
        ),
      ],
      sessions: const [SessionDay(date: 'Oct 19, 2024', attended: 81)],
      announcements: const [
        CourseAnnouncement(
          author: 'Prof. Rivers',
          initials: 'PR',
          time: 'Yesterday',
          title: 'Lab session moved online',
          body:
              'This week\u2019s lab moves to Zoom — link is on the course feed.',
          views: 67,
          comments: 2,
        ),
      ],
    ),
    LecturerCourse(
      id: 'ai405',
      code: 'AI-405',
      name: 'Neural Network Architectures',
      semester: 'Fall 2024',
      level: 'Postgraduate',
      studentsEnrolled: 86,
      syllabusCompletion: 0.9,
      avgAttendance: 88,
      nextLecture: 'Fri, 13:00',
      lectureHall: 'Hall 1C',
      resources: const [
        CourseResource(
          title: 'Paper Readings',
          subtitle: '6 files \u00b7 Updated 2 weeks ago',
          type: 'folder',
        ),
      ],
      sessions: const [SessionDay(date: 'Oct 18, 2024', attended: 90)],
      announcements: const [],
    ),
  ];

  static final assignments = <LecturerAssignment>[
    LecturerAssignment(
      id: 'la-cs402-1',
      code: 'CS-402',
      title: 'UX Design Principles',
      subtitle: 'Mid-term Case Study Analysis',
      totalSubmissions: 36,
      gradedCount: 24,
      status: LecturerAssignmentStatus.grading,
      dueLabel: 'Due Oct 15, 2024',
    ),
    LecturerAssignment(
      id: 'la-cs402-2',
      code: 'CS-402',
      title: 'Advanced Algorithms',
      subtitle: 'Time Complexity Research Paper',
      totalSubmissions: 40,
      gradedCount: 35,
      status: LecturerAssignmentStatus.grading,
      dueLabel: 'Due Oct 12, 2024',
    ),
    LecturerAssignment(
      id: 'la-cs302-1',
      code: 'CS-302',
      title: 'Greedy Strategies Problem Set',
      subtitle: 'Theory + coding exercises',
      totalSubmissions: 128,
      gradedCount: 128,
      status: LecturerAssignmentStatus.closed,
      dueLabel: 'Closed',
    ),
    LecturerAssignment(
      id: 'la-ds101-1',
      code: 'DS-101',
      title: 'EDA on Housing Data',
      subtitle: 'Notebook submission',
      totalSubmissions: 245,
      gradedCount: 0,
      status: LecturerAssignmentStatus.active,
      dueLabel: 'Due Oct 30, 2024',
    ),
  ];

  static final submissions = <Submission>[
    const Submission(
      id: 's-cs402-1',
      studentName: 'Amara Okafor',
      initials: 'AO',
      meta: 'Submitted Oct 12, 09:45 AM',
      status: SubmissionStatus.submitted,
    ),
    const Submission(
      id: 's-cs402-2',
      studentName: 'Julian Vance',
      initials: 'JV',
      meta: 'Late (2h 15m)',
      status: SubmissionStatus.late,
    ),
    const Submission(
      id: 's-cs402-3',
      studentName: 'Sarah Miller',
      initials: 'SM',
      meta: 'Graded Oct 11',
      status: SubmissionStatus.graded,
      score: 94,
    ),
  ];

  static final quizzes = <LecturerQuiz>[
    LecturerQuiz(
      id: 'lq-cs402-4',
      courseCode: 'ECON 302',
      title: 'Advanced Macroeconomics Quiz 4',
      questionCount: 30,
      durationMins: 45,
      status: 'active',
      section: 'Section A \u00b7 Fall 2023 \u00b7 142 Students',
      students: 142,
      classAverage: 78.4,
      highestScore: 98.0,
      completionRate: 94,
      badge: 'Due in 2 hours',
    ),
    LecturerQuiz(
      id: 'lq-cs402-5',
      courseCode: 'CS 101',
      title: 'Final Project Quiz',
      questionCount: 50,
      durationMins: 120,
      status: 'upcoming',
      badge: 'Unlocks Oct 24, 09:00 AM',
    ),
    LecturerQuiz(
      id: 'lq-psyc-6',
      courseCode: 'PSYC 201',
      title: 'Weekly Quiz #4',
      questionCount: 15,
      durationMins: 20,
      status: 'completed',
      badge: 'Scored: 92%',
    ),
  ];

  static final draftQuestions = <DraftQuestion>[
    const DraftQuestion(
      text:
          'Which of the following best defines \u201CGross Domestic Product\u201D?',
      options: [
        'The total value of goods produced by citizens abroad.',
        'The total market value of all final goods and services produced '
            'within a country.',
        'The sum of all government spending in a fiscal year.',
      ],
      answerIndex: 1,
    ),
    const DraftQuestion(
      text: 'Explain the relationship between inflation and interest rates.',
      options: [],
    ),
  ];

  static const atRiskStudents = <AtRiskStudent>[
    AtRiskStudent(name: 'Marcus Holloway', reason: 'Grade: 58%'),
    AtRiskStudent(name: 'Elena Rodriguez', reason: 'Attendance: 62%'),
    AtRiskStudent(name: 'Jordan Smith', reason: 'Missing: 3 Tasks'),
  ];

  static const attendanceTrend = <AttendancePoint>[
    AttendancePoint('Mon', 0.86),
    AttendancePoint('Tue', 0.91),
    AttendancePoint('Wed', 0.88),
    AttendancePoint('Thu', 0.95),
    AttendancePoint('Fri', 0.92),
  ];

  static final notifications = <AppNotification>[
    const AppNotification(
      id: 'ln1',
      title: 'New submission in CS402',
      time: '12m ago',
      body:
          'Elena Vance uploaded \u201CFinal Project Draft\u201D for Cognitive Studies.',
      category: 'deadline',
      unread: true,
      actionLabel: 'Grade',
    ),
    const AppNotification(
      id: 'ln2',
      title: 'Forum discussion in Applied Ethics',
      time: '1h ago',
      body: 'New discussion regarding Chapter 4.',
      category: 'announcement',
      unread: true,
    ),
    const AppNotification(
      id: 'ln3',
      title: 'Direct message from Dr. Aris Thorne',
      time: '3h ago',
      body: 'Sent you a message about the departmental review.',
      category: 'material',
      unread: true,
    ),
    const AppNotification(
      id: 'ln4',
      title: 'Batch graded',
      time: '1d ago',
      body: 'CS402 assignment grades are now published.',
      category: 'grade',
      unread: false,
      actionLabel: 'View',
    ),
  ];

  @override
  List<LecturerCourse> getCourses() => courses;

  @override
  LecturerCourse courseById(String id) =>
      courses.firstWhere((c) => c.id == id, orElse: () => courses.first);

  @override
  List<LecturerAssignment> getAssignments() => assignments;

  @override
  LecturerAssignment assignmentById(String id) => assignments.firstWhere(
    (a) => a.id == id,
    orElse: () => assignments.first,
  );

  @override
  List<Submission> getSubmissions(String assignmentId) => submissions;

  @override
  List<LecturerQuiz> getQuizzes() => quizzes;

  @override
  List<DraftQuestion> getDraftQuestions() => draftQuestions;

  @override
  List<AtRiskStudent> getAtRiskStudents() => atRiskStudents;

  @override
  List<AttendancePoint> getAttendanceTrend() => attendanceTrend;

  @override
  List<AppNotification> getNotifications() => notifications;
}
