import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';

/// Bottom nav + drawer configuration for the student role.
abstract final class StudentShell {
  static const String title = 'Academic Portal';
  static const String notificationPath = '/student/notifications';

  static const List<ShellDestination> destinations = [
    ShellDestination(
      label: 'Home',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      path: '/student/home',
    ),
    ShellDestination(
      label: 'Courses',
      icon: Icons.menu_book_outlined,
      selectedIcon: Icons.menu_book,
      path: '/student/courses',
    ),
    ShellDestination(
      label: 'Quizzes',
      icon: Icons.quiz_outlined,
      selectedIcon: Icons.quiz,
      path: '/student/quizzes',
    ),
    ShellDestination(
      label: 'Performance',
      icon: Icons.bar_chart_outlined,
      selectedIcon: Icons.bar_chart,
      path: '/student/performance',
    ),
    ShellDestination(
      label: 'Notifications',
      icon: Icons.notifications_outlined,
      selectedIcon: Icons.notifications,
      path: '/student/notifications',
    ),
  ];

  static const List<ShellDrawerSection> drawerSections = [
    ShellDrawerSection(
      title: 'Account',
      items: [
        ShellDestination(
          label: 'Profile',
          icon: Icons.person_outline,
          path: '/student/profile',
        ),
        ShellDestination(
          label: 'Settings',
          icon: Icons.settings_outlined,
          path: '/student/settings',
        ),
      ],
    ),
    ShellDrawerSection(
      title: 'Support',
      items: [
        ShellDestination(
          label: 'Help',
          icon: Icons.help_outline,
          path: '/student/help',
        ),
      ],
    ),
  ];
}
