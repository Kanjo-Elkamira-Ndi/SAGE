import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../core/sage_exception.dart';
import '../../data/models/api/course.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// "My Courses" grid — wired to `GET /courses` (`api-wiring-plan.md` §A.2).
/// Loading → skeletons; failure → inline retry; empty → empty state.
class StudentCoursesPage extends ConsumerWidget {
  const StudentCoursesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(apiCoursesProvider);

    return StudentPageScaffold(
      child: coursesAsync.when(
        loading: () => const _CoursesLoading(),
        error: (error, _) => _CoursesError(error: error, onRetry: () {
          ref.invalidate(apiCoursesProvider);
        }),
        data: (page) {
          final courses = page.items;
          if (courses.isEmpty) {
            return const _CoursesEmpty();
          }
          return ListView(
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
                '${page.total} courses this semester',
                style: const TextStyle(
                  fontSize: 14,
                  color: StudentColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 16),
              for (final course in courses) ...[
                _CourseCard(course: course),
                const SizedBox(height: 12),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course});

  final ApiCourse course;

  @override
  Widget build(BuildContext context) {
    return SageCard(
      padding: const EdgeInsets.all(16),
      onTap: () => context.go('/student/course/${course.id}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CourseCodeBadge(code: course.code),
              const Spacer(),
              const Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: StudentColors.outline,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            course.title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            course.lecturerName,
            style: const TextStyle(
              fontSize: 12,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              if (course.semester != null)
                const SageBadge(
                  label: 'In Progress',
                  variant: SageBadgeVariant.warning,
                  compact: true,
                ),
              if (course.creditUnits != null)
                SageBadge(
                  label: '${course.creditUnits} CU',
                  variant: SageBadgeVariant.primary,
                  compact: true,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CoursesLoading extends StatelessWidget {
  const _CoursesLoading();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      children: [
        const StudentSkeletonBlock(width: 160, height: 26),
        const SizedBox(height: 8),
        const StudentSkeletonBlock(width: 180, height: 14),
        const SizedBox(height: 16),
        for (var i = 0; i < 3; i++) ...[
          const StudentSkeletonBlock(height: 110, radius: 14),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _CoursesEmpty extends StatelessWidget {
  const _CoursesEmpty();

  @override
  Widget build(BuildContext context) {
    return const StudentEmptyState(
      icon: Icons.menu_book_outlined,
      title: 'No courses yet',
      description: 'Enroll in a course to see it here.',
    );
  }
}

class _CoursesError extends StatelessWidget {
  const _CoursesError({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final e = error;
    final message =
        e is SageException ? e.message : 'Could not load your courses.';
    return StudentEmptyState(
      icon: Icons.wifi_off_outlined,
      title: 'Something went wrong',
      description: message,
      actionLabel: 'Retry',
      onAction: onRetry,
    );
  }
}
