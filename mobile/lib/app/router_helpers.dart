import '../data/models/user.dart';

class _Tab {
  const _Tab(this.path, this.title);

  final String path;
  final String title;
}

/// Student tab placeholder routes (Phase 3 replaces the bodies).
const studentTabs = [
  _Tab('/student/courses', 'Courses'),
  _Tab('/student/quizzes', 'Quizzes'),
  _Tab('/student/performance', 'Performance'),
  _Tab('/student/notifications', 'Notifications'),
  _Tab('/student/profile', 'Profile'),
  _Tab('/student/settings', 'Settings'),
  _Tab('/student/help', 'Help'),
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
