import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/sage_button.dart';
import 'student_colors.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// 403 — "Content unavailable" with lock icon and Go Home action.
class Student403Page extends StatelessWidget {
  const Student403Page({super.key});

  @override
  Widget build(BuildContext context) {
    return StudentPageScaffold(
      child: StudentEmptyState(
        icon: Icons.lock_outline,
        title: 'Content unavailable',
        description:
            'You don\u2019t have permission to view this page.\n'
            'If you think this is a mistake, contact your lecturer.',
        actionLabel: 'Go Home',
        onAction: () => context.go('/student/home'),
      ),
    );
  }
}

/// 404 — oversized "404" with a search prompt.
class Student404Page extends StatelessWidget {
  const Student404Page({super.key});

  @override
  Widget build(BuildContext context) {
    return StudentPageScaffold(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(30),
                    decoration: const BoxDecoration(
                      color: StudentColors.surfaceContainer,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.sentiment_dissatisfied,
                      size: 56,
                      color: StudentColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                '404',
                style: TextStyle(
                  fontSize: 64,
                  fontWeight: FontWeight.w800,
                  color: StudentColors.primary.withValues(alpha: 0.14),
                  height: 1,
                ),
              ),
              const Text(
                'Page not found',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: StudentColors.primary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'The page you\u2019re looking for doesn\u2019t exist.\n'
                'Try searching or head back home.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: StudentColors.onSurfaceVariant,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 20),
              SageButton(
                onPressed: () => context.go('/student/home'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// System error — unexpected failure with royal-blue / gold accents.
class StudentSystemErrorPage extends StatelessWidget {
  const StudentSystemErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return StudentPageScaffold(
      child: StudentEmptyState(
        icon: Icons.running_with_errors,
        title: 'Something went wrong',
        description:
            'An unexpected error occurred. Please try again.\n'
            'If it keeps happening, contact support.',
        actionLabel: 'Try Again',
        onAction: () => context.go('/student/home'),
      ),
    );
  }
}

/// Loading — skeleton blocks while student data streams in.
class StudentLoadingPage extends StatelessWidget {
  const StudentLoadingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: const [
          StudentSkeletonBlock(width: 180, height: 24, radius: 8),
          SizedBox(height: 8),
          StudentSkeletonBlock(width: 140, height: 14, radius: 7),
          SizedBox(height: 20),
          StudentSkeletonBlock(height: 96, radius: 14),
          SizedBox(height: 12),
          StudentSkeletonBlock(height: 96, radius: 14),
          SizedBox(height: 12),
          StudentSkeletonBlock(height: 96, radius: 14),
          SizedBox(height: 12),
          StudentSkeletonBlock(height: 96, radius: 14),
        ],
      ),
    );
  }
}
