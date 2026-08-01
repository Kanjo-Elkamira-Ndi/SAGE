import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// "My Courses" grid — course cards with code badge, lecturer, schedule chip,
/// and progress (Stitch student courses screen).
class StudentCoursesPage extends ConsumerWidget {
  const StudentCoursesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(studentControllerProvider.notifier).courses;

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'My Courses',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${courses.length} courses this semester',
            style: const TextStyle(
              fontSize: 14,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          for (final course in courses) ...[
            SageCard(
              padding: const EdgeInsets.all(16),
              onTap: () => context.go('/student/course/${course.id}'),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CourseCodeBadge(code: course.code),
                      const Spacer(),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: StudentColors.outline,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    course.name,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    course.instructor,
                    style: const TextStyle(
                      fontSize: 12,
                      color: StudentColors.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Wrap(
                    spacing: 8,
                    children: [
                      SageBadge(
                        label: 'Lecture \u00b7 Tue 10:00',
                        variant: SageBadgeVariant.primary,
                        compact: true,
                      ),
                      SageBadge(
                        label: 'In Progress',
                        variant: SageBadgeVariant.warning,
                        compact: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SageProgressBar(
                    value: course.progress,
                    height: 6,
                    label: 'Course progress',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}
