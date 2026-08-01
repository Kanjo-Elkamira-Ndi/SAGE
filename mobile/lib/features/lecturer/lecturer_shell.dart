import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';

/// Bottom nav + drawer configuration for the lecturer role, following the
/// Stitch lecturer app design: Dashboard · Courses · Tasks · Analytics.
abstract final class LecturerShell {
  static const String title = 'SAGE Lecturer';
  static const String notificationPath = '/lecturer/notifications';

  static const List<ShellDestination> destinations = [
    ShellDestination(
      label: 'Dashboard',
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
      path: '/lecturer/home',
    ),
    ShellDestination(
      label: 'Courses',
      icon: Icons.menu_book_outlined,
      selectedIcon: Icons.menu_book,
      path: '/lecturer/courses',
    ),
    ShellDestination(
      label: 'Tasks',
      icon: Icons.assignment_outlined,
      selectedIcon: Icons.assignment,
      path: '/lecturer/tasks',
    ),
    ShellDestination(
      label: 'Analytics',
      icon: Icons.insert_chart_outlined,
      selectedIcon: Icons.insert_chart,
      path: '/lecturer/analytics',
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
