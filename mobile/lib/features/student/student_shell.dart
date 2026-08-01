import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';

/// Bottom nav + drawer configuration for the student role, following the
/// Stitch student app design: Dashboard · Courses · Tasks · Analytics.
abstract final class StudentShell {
  static const String title = 'SAGE';
  static const String notificationPath = '/student/notifications';

  static const List<ShellDestination> destinations = [
    ShellDestination(
      label: 'Dashboard',
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
      path: '/student/home',
    ),
    ShellDestination(
      label: 'Courses',
      icon: Icons.menu_book_outlined,
      selectedIcon: Icons.menu_book,
      path: '/student/courses',
    ),
    ShellDestination(
      label: 'Tasks',
      icon: Icons.assignment_outlined,
      selectedIcon: Icons.assignment,
      path: '/student/tasks',
    ),
    ShellDestination(
      label: 'Analytics',
      icon: Icons.insert_chart_outlined,
      selectedIcon: Icons.insert_chart,
      path: '/student/analytics',
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
          label: 'Schedule',
          icon: Icons.calendar_today_outlined,
          path: '/student/schedule',
        ),
        ShellDestination(
          label: 'Grades',
          icon: Icons.grade_outlined,
          path: '/student/grades',
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
