import 'package:flutter/material.dart';

import '../../data/models/student.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_button.dart';
import 'student_colors.dart';

/// Small student-specific primitives shared across the student screens.

/// Status pill for an assignment row.
class AssignmentStatusBadge extends StatelessWidget {
  const AssignmentStatusBadge({super.key, required this.status});

  final AssignmentStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, variant, icon) = switch (status) {
      AssignmentStatus.overdue => ('Overdue', SageBadgeVariant.danger, Icons.error_outline),
      AssignmentStatus.dueSoon => ('Due Soon', SageBadgeVariant.warning, Icons.schedule),
      AssignmentStatus.pending => ('Pending', SageBadgeVariant.neutral, Icons.hourglass_empty),
      AssignmentStatus.submitted => ('Submitted', SageBadgeVariant.info, Icons.cloud_done_outlined),
      AssignmentStatus.graded => ('Completed', SageBadgeVariant.success, Icons.check_circle_outline),
    };
    return SageBadge(label: label, variant: variant, icon: icon, compact: true);
  }
}

/// Status pill for a quiz row.
class QuizStatusBadge extends StatelessWidget {
  const QuizStatusBadge({super.key, required this.status});

  final QuizStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, variant) = switch (status) {
      QuizStatus.active => ('Active', SageBadgeVariant.accent),
      QuizStatus.upcoming => ('Upcoming', SageBadgeVariant.info),
      QuizStatus.locked => ('Locked', SageBadgeVariant.neutral),
      QuizStatus.completed => ('Completed', SageBadgeVariant.success),
    };
    return SageBadge(label: label, variant: variant, compact: true);
  }
}

/// Royal-blue pill with the course code (e.g. "CS-402").
class CourseCodeBadge extends StatelessWidget {
  const CourseCodeBadge({super.key, required this.code});

  final String code;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: StudentColors.primary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        code,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Section header with an optional trailing action.
class StudentSectionHeader extends StatelessWidget {
  const StudentSectionHeader({
    super.key,
    required this.title,
    this.trailing,
    this.onTrailingTap,
  });

  final String title;
  final String? trailing;
  final VoidCallback? onTrailingTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
        if (trailing != null)
          TextButton(
            onPressed: onTrailingTap,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              trailing!,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: StudentColors.primary,
              ),
            ),
          ),
      ],
    );
  }
}

/// Small value + label stat used in the analytics grid.
class StudentMiniStat extends StatelessWidget {
  const StudentMiniStat({super.key, required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: StudentColors.surfaceContainer,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

/// Student-flavored empty state (matches the Stitch empty illustration layout).
class StudentEmptyState extends StatelessWidget {
  const StudentEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.description,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String? description;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: StudentColors.surfaceContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: StudentColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: StudentColors.primary,
              ),
            ),
            if (description != null) ...[
              const SizedBox(height: 6),
              Text(
                description!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: StudentColors.onSurfaceVariant,
                  height: 1.5,
                ),
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 16),
              SageButton(
                variant: SageButtonVariant.accent,
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Pulsing skeleton block (loading state).
class StudentSkeletonBlock extends StatelessWidget {
  const StudentSkeletonBlock({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.radius = 8,
  });

  final double width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: StudentColors.surfaceHighest,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
