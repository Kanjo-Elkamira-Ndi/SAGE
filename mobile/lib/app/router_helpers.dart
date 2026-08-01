import '../data/models/user.dart';

class _Tab {
  const _Tab(this.path, this.title);

  final String path;
  final String title;
}

/// Student routes that still render the placeholder body until built.
const studentPlaceholderTabs = [
  _Tab('/student/help', 'Help'),
  _Tab('/student/schedule', 'Schedule'),
  _Tab('/student/grades', 'Grades'),
];

/// Lecturer tab placeholder routes (Phase 4 replaces the bodies).
const lecturerTabs = [
  _Tab('/lecturer/courses', 'Courses'),
  _Tab('/lecturer/assignments', 'Assignments'),
  _Tab('/lecturer/quizzes', 'Quizzes'),
  _Tab('/lecturer/performance', 'Performance'),
  _Tab('/lecturer/notifications', 'Notifications'),
  _Tab('/lecturer/profile', 'Profile'),
  _Tab('/lecturer/settings', 'Settings'),
  _Tab('/lecturer/help', 'Help'),
];

/// Role → home route. Admin is web-only; falls back to the student home here.
String homeFor(Role role) => switch (role) {
      Role.student => '/student/home',
      Role.lecturer => '/lecturer/home',
      Role.admin => '/student/home',
    };

/// Whether [path] belongs to the given role's area.
bool isRoleArea(Role role, String path) => switch (role) {
      Role.student => path.startsWith('/student'),
      Role.lecturer => path.startsWith('/lecturer'),
      Role.admin => false,
    };
