import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/models/lecturer.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Lecturer tasks — "Pending Grading" cards per course plus the full list of
/// assignments. Maps to the Stitch grading_submissions reference screen.
class LecturerTasksPage extends ConsumerWidget {
  const LecturerTasksPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.watch(lecturerControllerProvider.notifier);
    final assignments = controller.assignments;
    final grading = assignments.where(
      (a) => a.status == LecturerAssignmentStatus.grading,
    );

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
          if (grading.isNotEmpty)
            for (final assignment in grading) ...[
              _GradingCard(assignment: assignment),
              const SizedBox(height: 12),
            ],
          const SizedBox(height: 8),
          LecturerSectionHeader(
            title: 'All Assignments',
            trailing: 'New',
            onTrailingTap: () => context.push('/lecturer/create_assignment'),
          ),
          const SizedBox(height: 10),
          if (assignments.isEmpty)
            const LecturerEmptyState(
              icon: Icons.assignment_outlined,
              title: 'No assignments yet',
              description: 'Create your first assignment to get started.',
            )
          else
            for (final assignment in assignments) ...[
              _AssignmentRow(assignment: assignment),
              const SizedBox(height: 10),
            ],
        ],
      ),
    );
  }
}

class _GradingCard extends StatelessWidget {
  const _GradingCard({required this.assignment});

  final LecturerAssignment assignment;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: LecturerColors.surfaceLowest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => context.push('/lecturer/grading', extra: assignment.id),
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
                    label: assignment.code,
                    variant: SageBadgeVariant.accent,
                  ),
                  const Spacer(),
                  Text(
                    '${assignment.pendingCount} Pending',
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
                assignment.subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(
                    '${assignment.gradedCount}/${assignment.totalSubmissions} '
                    'Graded',
                    style: const TextStyle(
                      fontSize: 12,
                      color: LecturerColors.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${(assignment.gradedFraction * 100).round()}%',
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
                value: assignment.gradedFraction,
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

class _AssignmentRow extends StatelessWidget {
  const _AssignmentRow({required this.assignment});

  final LecturerAssignment assignment;

  String get _statusLabel => switch (assignment.status) {
    LecturerAssignmentStatus.grading => 'Grading',
    LecturerAssignmentStatus.active => 'Active',
    LecturerAssignmentStatus.closed => 'Closed',
  };

  SageBadgeVariant get _statusVariant => switch (assignment.status) {
    LecturerAssignmentStatus.grading => SageBadgeVariant.accent,
    LecturerAssignmentStatus.active => SageBadgeVariant.info,
    LecturerAssignmentStatus.closed => SageBadgeVariant.neutral,
  };

  @override
  Widget build(BuildContext context) {
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
                  '${assignment.code} \u2022 ${assignment.dueLabel ?? ''}',
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
              LecturerTag(label: _statusLabel, variant: _statusVariant),
              const SizedBox(height: 4),
              Text(
                '${assignment.pendingCount} left',
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
