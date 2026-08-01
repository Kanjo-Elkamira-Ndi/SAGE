import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';
import 'lecturer_colors.dart';
import 'lecturer_shell.dart';

/// Standard frame for every lecturer screen: Stitch-style white app bar with
/// royal-blue text, gold active pill bottom nav, and the SAGE tokens.
class LecturerPageScaffold extends StatelessWidget {
  const LecturerPageScaffold({super.key, required this.child, this.title});

  final Widget child;

  /// Optional app bar title; defaults to the "SAGE Lecturer" brand.
  final String? title;

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: title ?? LecturerShell.title,
      destinations: LecturerShell.destinations,
      drawerSections: LecturerShell.drawerSections,
      notificationPath: LecturerShell.notificationPath,
      appBarColor: LecturerColors.surfaceLowest,
      appBarForeground: LecturerColors.primary,
      bodyBackground: LecturerColors.background,
      navActiveBackground: LecturerColors.secondaryContainer,
      navActiveForeground: LecturerColors.onSecondaryContainer,
      child: child,
    );
  }
}
