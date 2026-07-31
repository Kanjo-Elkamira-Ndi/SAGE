import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';

/// Bottom nav + drawer configuration for the lecturer role.
abstract final class LecturerShell {
  static const String title = 'Lecturer Portal';
  static const String notificationPath = '/lecturer/notifications';

  static const List<ShellDestination> destinations = [
    ShellDestination(
      label: 'Home',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      path: '/lecturer/home',
    ),
    ShellDestination(
      label: 'Courses',
      icon: Icons.menu_book_outlined,
      selectedIcon: Icons.menu_book,
      path: '/lecturer/courses',
    ),
    ShellDestination(
      label: 'Assignments',
      icon: Icons.assignment_outlined,
      selectedIcon: Icons.assignment,
      path: '/lecturer/assignments',
    ),
    ShellDestination(
      label: 'Quizzes',
      icon: Icons.quiz_outlined,
      selectedIcon: Icons.quiz,
      path: '/lecturer/quizzes',
    ),
    ShellDestination(
      label: 'Performance',
      icon: Icons.bar_chart_outlined,
      selectedIcon: Icons.bar_chart,
      path: '/lecturer/performance',
    ),
  ];

  static const List<ShellDrawerSection> drawerSections = [
    ShellDrawerSection(
      title: 'Account',
      items: [
        ShellDestination(
          label: 'Profile',
          icon: Icons.person_outline,
          path: '/lecturer/profile',
        ),
        ShellDestination(
          label: 'Settings',
          icon: Icons.settings_outlined,
          path: '/lecturer/settings',
        ),
      ],
    ),
    ShellDrawerSection(
      title: 'Support',
      items: [
        ShellDestination(
          label: 'Help',
          icon: Icons.help_outline,
          path: '/lecturer/help',
        ),
      ],
    ),
  ];
}
