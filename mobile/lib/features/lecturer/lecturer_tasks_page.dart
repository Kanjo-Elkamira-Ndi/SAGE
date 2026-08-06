import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/models/api/assignment.dart';
import '../../data/models/api/course.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Lecturer tasks — "Pending Grading" cards per assignment plus the full list
/// of assignments. Maps to the Stitch grading_submissions reference screen.
class LecturerTasksPage extends ConsumerWidget {
  const LecturerTasksPage({super.key});

  String _codeOf(List<ApiCourse> courses, String courseId) {
    for (final c in courses) {
      if (c.id == courseId) return c.code;
    }
    return 'COURSE';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assignmentsAsync = ref.watch(lecturerAllAssignmentsProvider);
    final coursesAsync = ref.watch(lecturerApiCoursesProvider);

    return LecturerPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Pending Grading',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Manage submissions across your active courses.',
            style: TextStyle(
              fontSize: 13,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          if (assignmentsAsync.isLoading)
            const Column(
              children: [
                LecturerSkeletonBlock(height: 120, radius: 14),
                SizedBox(height: 12),
                LecturerSkeletonBlock(height: 120, radius: 14),
              ],
            )
          else if (assignmentsAsync.hasError)
            _TasksError(
              onRetry: () => ref.invalidate(lecturerAllAssignmentsProvider),
            )
          else
            for (final assignment in assignmentsAsync.value!) ...[
              _PendingGradingTile(
                assignment: assignment,
                code: _codeOf(coursesAsync.value?.items ?? const [], assignment.courseId),
              ),
              const SizedBox(height: 12),
            ],
          const SizedBox(height: 8),
          LecturerSectionHeader(
            title: 'All Assignments',
            trailing: 'New',
            onTrailingTap: () => context.push('/lecturer/create_assignment'),
          ),
          const SizedBox(height: 10),
          if (assignmentsAsync.value?.isEmpty ?? true)
            const LecturerEmptyState(
              icon: Icons.assignment_outlined,
              title: 'No assignments yet',
              description: 'Create your first assignment to get started.',
            )
          else
            for (final assignment in assignmentsAsync.value!) ...[
              _AssignmentRow(
                assignment: assignment,
                code: _codeOf(coursesAsync.value?.items ?? const [], assignment.courseId),
              ),
              const SizedBox(height: 10),
            ],
        ],
      ),
    );
  }
}

class _TasksError extends StatelessWidget {
  const _TasksError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LecturerColors.outlineVariant),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline,
            size: 20,
            color: LecturerColors.error,
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Could not load assignments.',
              style: TextStyle(
                fontSize: 13,
                color: LecturerColors.onSurfaceVariant,
              ),
            ),
          ),
          TextButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

/// Pending-grading card — only surfaced when an assignment still has
/// ungraded submissions.
class _PendingGradingTile extends ConsumerWidget {
  const _PendingGradingTile({required this.assignment, required this.code});

  final ApiAssignment assignment;
  final String code;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync =
        ref.watch(lecturerAssignmentGradingSummaryProvider(assignment.id));
    final summary = summaryAsync.value;
    if (summary == null || summary.graded >= summary.total) {
      return const SizedBox.shrink();
    }
    final pending = summary.total - summary.graded;
    final fraction = summary.total == 0
        ? 1.0
        : (summary.graded / summary.total).clamp(0.0, 1.0);

    return Material(
      color: LecturerColors.surfaceLowest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () =>
            context.push('/lecturer/grading', extra: assignment.id),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: LecturerColors.outlineVariant),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  LecturerTag(
                    label: code,
                    variant: SageBadgeVariant.accent,
                  ),
                  const Spacer(),
                  Text(
                    '$pending Pending',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: LecturerColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                assignment.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                assignment.instructions ?? assignment.dueLabel,
                style: const TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(
                    '${summary.graded}/${summary.total} '
                    'Graded',
                    style: const TextStyle(
                      fontSize: 12,
                      color: LecturerColors.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${(fraction * 100).round()}%',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: LecturerColors.academicGold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SageProgressBar(
                value: fraction,
                height: 6,
                showPercent: false,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AssignmentRow extends ConsumerWidget {
  const _AssignmentRow({required this.assignment, required this.code});

  final ApiAssignment assignment;
  final String code;

  String _statusLabel(int pending) {
    if (pending > 0) return 'Grading';
    if (assignment.deadlineAt.isBefore(DateTime.now())) return 'Closed';
    return 'Active';
  }

  SageBadgeVariant _statusVariant(int pending) {
    if (pending > 0) return SageBadgeVariant.accent;
    if (assignment.deadlineAt.isBefore(DateTime.now())) {
      return SageBadgeVariant.neutral;
    }
    return SageBadgeVariant.info;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync =
        ref.watch(lecturerAssignmentGradingSummaryProvider(assignment.id));
    final summary = summaryAsync.value;
    if (summary == null) {
      return const LecturerSkeletonBlock(height: 72, radius: 14);
    }
    final pending = summary.total - summary.graded;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LecturerColors.outlineVariant),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: LecturerColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.assignment_outlined,
              size: 20,
              color: LecturerColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  assignment.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: LecturerColors.primary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$code \u2022 ${assignment.dueLabel}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: LecturerColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              LecturerTag(label: _statusLabel(pending), variant: _statusVariant(pending)),
              const SizedBox(height: 4),
              Text(
                '$pending left',
                style: const TextStyle(
                  fontSize: 11,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
