import 'package:flutter/material.dart';

import '../../shared/widgets/app_shell.dart';
import 'student_colors.dart';
import 'student_shell.dart';

/// Standard frame for every student screen: Stitch-style white app bar with
/// royal-blue text, gold active pill bottom nav, and the SAGE student tokens.
class StudentPageScaffold extends StatelessWidget {
  const StudentPageScaffold({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: StudentShell.title,
      destinations: StudentShell.destinations,
      drawerSections: StudentShell.drawerSections,
      notificationPath: StudentShell.notificationPath,
      appBarColor: StudentColors.surfaceLowest,
      appBarForeground: StudentColors.primary,
      bodyBackground: StudentColors.background,
      navActiveBackground: StudentColors.secondaryContainer,
      navActiveForeground: StudentColors.onSecondaryContainer,
      child: child,
    );
  }
}
