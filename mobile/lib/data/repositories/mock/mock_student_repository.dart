import '../../models/student.dart';
import '../student_repository.dart';

/// In-memory student data seeded from the SAGE student app screens (Stitch
/// project 20116894548131772). Replaced by `/api/student/*` in Phase 6.
class MockStudentRepository implements StudentRepository {
  MockStudentRepository();

  static final courses = <StudentCourse>[
    StudentCourse(
      id: 'cs402',
      code: 'CS-402',
      name: 'Advanced Algorithms & Data Structures',
      instructor: 'Dr. Elizabeth Thorne',
      progress: 0.72,
      grade: 'A-',
      attendance: 0.98,
      assignmentsProgress: 0.64,
      description:
          'Topics: Cover Python syntax, functions, variables, and basic algorithms. '
          'Master search, sorting, and graph techniques with hands-on labs.',
      modules: const [
        CourseModule(
          title: 'Introduction to Algorithms',
          number: '01',
          items: [
            CourseMaterial(title: 'Module 1 - Intro Notes', type: 'description'),
            CourseMaterial(
              title: 'Module 1 - Lecture Video',
              type: 'play_circle',
            ),
          ],
        ),
        CourseModule(
          title: 'Data Structures',
          number: '02',
          items: [
            CourseMaterial(
              title: 'Module 2 - Stacks & Queues',
              type: 'description',
            ),
            CourseMaterial(title: 'Module 2 - Arrays Lab', type: 'code'),
          ],
        ),
        CourseModule(
          title: 'Graph Algorithms',
          number: '03',
          locked: true,
          unlockText: 'Unlocks Nov 12',
        ),
      ],
      feed: const [
        CourseFeedItem(
          title: 'New Lecture Slides Uploaded',
          time: '2h ago',
          body: 'Slides for the next session are now available in the syllabus.',
          accent: 'secondary',
        ),
        CourseFeedItem(
          title: 'New Assignment: Assignment 2',
          time: '5h ago',
          body: 'Assignment 2 is now open. Due Fri, 20 Jun · 23:59.',
        ),
        CourseFeedItem(
          title: 'Grade available for Assignment 1',
          time: '2d ago',
          body: 'Assignment 1 grades are published. Average was 84%.',
        ),
      ],
      assignments: const [
        Assignment(
          id: 'a-cs402-2',
          title: 'UX Evaluation',
          description:
              'Evaluate the usability of a chosen interface and write a short report.',
          courseCode: 'CS-402',
          points: 100,
          status: AssignmentStatus.dueSoon,
          dueLabel: 'Due Fri, 20 Jun · 23:59',
        ),
        Assignment(
          id: 'a-cs402-1',
          title: 'Algorithm Basics',
          description: 'Solve 10 algorithm problems and submit your solutions.',
          courseCode: 'CS-402',
          points: 50,
          status: AssignmentStatus.graded,
          completedLabel: 'Completed · 94%',
        ),
      ],
    ),
    StudentCourse(
      id: 'mth301',
      code: 'MTH301',
      name: 'Advanced Calculus',
      instructor: 'Dr. Elizabeth Thorne',
      progress: 0.45,
      grade: 'B+',
      attendance: 0.91,
      assignmentsProgress: 0.5,
      description:
          'Deep dive into limits, derivatives, integrals, and sequences '
          'with applied modelling problems.',
      modules: const [
        CourseModule(
          title: 'Limits & Continuity',
          number: '01',
          items: [
            CourseMaterial(title: 'Lecture 1 Notes', type: 'description'),
          ],
        ),
        CourseModule(
          title: 'Differentiation',
          number: '02',
          items: [
            CourseMaterial(title: 'Problem Set 1', type: 'code'),
          ],
        ),
        CourseModule(
          title: 'Integration',
          number: '03',
          locked: true,
          unlockText: 'Unlocks next week',
        ),
      ],
      feed: const [
        CourseFeedItem(
          title: 'Problem Set released',
          time: '1d ago',
          body: 'Problem Set 2 is due Friday at noon.',
        ),
      ],
      assignments: const [
        Assignment(
          id: 'a-mth301-2',
          title: 'Problem Set 2',
          description: 'Differentiation problems 1–15.',
          courseCode: 'MTH301',
          points: 40,
          status: AssignmentStatus.pending,
          dueLabel: 'Due Wed, 25 Jun · 12:00',
        ),
        Assignment(
          id: 'a-mth301-1',
          title: 'Problem Set 1',
          description: 'Limits and continuity exercises.',
          courseCode: 'MTH301',
          points: 40,
          status: AssignmentStatus.submitted,
          completedLabel: 'Submitted · Pending grade',
        ),
      ],
    ),
    StudentCourse(
      id: 'econ302',
      code: 'ECON302',
      name: 'Macroeconomics',
      instructor: 'Dr. Marcus Lee',
      progress: 0.3,
      grade: 'B',
      attendance: 0.85,
      assignmentsProgress: 0.33,
      description:
          'National income, inflation, unemployment, and monetary policy.',
      modules: const [
        CourseModule(
          title: 'GDP & National Accounts',
          number: '01',
          items: [
            CourseMaterial(title: 'Chapter 1 Slides', type: 'description'),
          ],
        ),
        CourseModule(
          title: 'Inflation & Unemployment',
          number: '02',
          locked: true,
          unlockText: 'Unlocks Dec 1',
        ),
      ],
      feed: const [
        CourseFeedItem(
          title: 'Quiz 4 announced',
          time: '3h ago',
          body: 'Quiz 4 opens today and is due in 2 hours.',
          accent: 'secondary',
        ),
      ],
      assignments: const [
        Assignment(
          id: 'a-econ302-1',
          title: 'Reading Response 3',
          description: 'Summarise Chapter 7 on monetary policy.',
          courseCode: 'ECON302',
          points: 20,
          status: AssignmentStatus.overdue,
          dueLabel: 'Due yesterday · 23:59',
        ),
      ],
    ),
    StudentCourse(
      id: 'ps101',
      code: 'PS101',
      name: 'Intro to Psychology',
      instructor: 'Dr. Ada Okonkwo',
      progress: 0.9,
      grade: 'A',
      attendance: 1.0,
      assignmentsProgress: 1.0,
      description: 'Foundations of cognition, behaviour, and development.',
      modules: const [
        CourseModule(
          title: 'Cognition',
          number: '01',
          items: [
            CourseMaterial(title: 'Lecture Notes', type: 'description'),
          ],
        ),
      ],
      feed: const [
        CourseFeedItem(
          title: 'Final revision guide',
          time: '6h ago',
          body: 'Revision guide for the final exam is live.',
        ),
      ],
      assignments: const [],
    ),
  ];

  static final quizzes = <Quiz>[
    Quiz(
      id: 'q-cs402-1',
      course: 'CS402',
      title: 'Quiz 1: Algorithm Fundamentals',
      durationMins: 4,
      questionCount: 3,
      status: QuizStatus.active,
      badge: 'Due in 2 hours',
      footnote: '3 questions · 4 min',
      buttonLabel: 'Start Quiz Now',
    ),
    Quiz(
      id: 'q-cs402-2',
      course: 'CS402',
      title: 'Quiz 2: Data Structures',
      durationMins: 5,
      questionCount: 4,
      status: QuizStatus.upcoming,
      badge: 'Next Week',
      footnote: '4 questions · 5 min',
      buttonLabel: 'View Study Guide',
    ),
    Quiz(
      id: 'q-econ302-4',
      course: 'ECON302',
      title: 'Quiz 4: Monetary Policy',
      durationMins: 4,
      questionCount: 3,
      status: QuizStatus.active,
      badge: 'Due in 2 hours',
      footnote: '3 questions · 4 min',
      buttonLabel: 'Start Quiz Now',
    ),
    Quiz(
      id: 'q-mth301-2',
      course: 'MTH301',
      title: 'Quiz 2: Differentiation',
      durationMins: 10,
      questionCount: 5,
      status: QuizStatus.upcoming,
      badge: 'Next Week',
      footnote: '5 questions · 10 min',
      buttonLabel: 'View Study Guide',
    ),
    Quiz(
      id: 'q-mth301-1',
      course: 'MTH301',
      title: 'Quiz 1: Limits',
      durationMins: 4,
      questionCount: 3,
      status: QuizStatus.completed,
      badge: 'Scored: 92%',
      footnote: '3 questions · 4 min',
      buttonLabel: 'Review Answers',
      score: 92,
    ),
    Quiz(
      id: 'q-ps101-3',
      course: 'PS101',
      title: 'Quiz 3: Memory',
      durationMins: 8,
      questionCount: 6,
      status: QuizStatus.locked,
      badge: 'Locked',
      footnote: 'Complete previous quiz to unlock',
      buttonLabel: 'Locked',
    ),
  ];

  static final quizQuestions = <QuizQuestion>[
    const QuizQuestion(
      text: 'Which data structure uses FIFO ordering?',
      options: ['Stack', 'Queue', 'Linked List', 'Hash Table'],
      answerIndex: 1,
    ),
    const QuizQuestion(
      text: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      answerIndex: 2,
    ),
    const QuizQuestion(
      text: 'Which sorting algorithm has the best average case?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      answerIndex: 2,
    ),
    const QuizQuestion(
      text: 'Which of the following is a non-linear data structure?',
      options: ['Array', 'Stack', 'Queue', 'Tree'],
      answerIndex: 3,
    ),
  ];

  static final notifications = <AppNotification>[
    const AppNotification(
      id: 'n1',
      title: 'Grade available in CS402',
      time: '10m ago',
      body: 'You scored 94% on Assignment 1.',
      category: 'grade',
      unread: true,
      actionLabel: 'View',
    ),
    const AppNotification(
      id: 'n2',
      title: 'New assignment in MTH301',
      time: '25m ago',
      body: 'Problem Set 2 is now available.',
      category: 'deadline',
      unread: true,
      actionLabel: 'Open',
    ),
    const AppNotification(
      id: 'n3',
      title: 'Quiz reminder: CS402',
      time: '1h ago',
      body: 'Quiz 1: Algorithm Fundamentals closes in 2 hours.',
      category: 'material',
      unread: true,
      actionLabel: 'Start',
    ),
    const AppNotification(
      id: 'n4',
      title: 'New course materials',
      time: '3h ago',
      body: 'Lecture slides were added to ECON302.',
      category: 'material',
      unread: false,
    ),
    const AppNotification(
      id: 'n5',
      title: 'Announcement from Dr. Thorne',
      time: '1d ago',
      body: 'Office hours moved to Thursday this week.',
      category: 'announcement',
      unread: false,
    ),
  ];

  @override
  List<StudentCourse> getCourses() => courses;

  @override
  StudentCourse courseById(String id) =>
      courses.firstWhere((c) => c.id == id, orElse: () => courses.first);

  @override
  List<Assignment> getAssignments() => [
        for (final course in courses) ...course.assignments,
      ];

  @override
  Assignment assignmentById(String id) =>
      getAssignments().firstWhere((a) => a.id == id);

  @override
  List<Quiz> getQuizzes() => quizzes;

  @override
  Quiz quizById(String id) =>
      quizzes.firstWhere((q) => q.id == id, orElse: () => quizzes.first);

  @override
  List<AppNotification> getNotifications() => notifications;
}
