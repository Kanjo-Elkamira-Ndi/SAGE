import 'package:flutter/material.dart';

import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_button.dart';
import 'lecturer_colors.dart';

/// Small lecturer-specific primitives shared across the lecturer screens.

/// Section header with an optional trailing action.
class LecturerSectionHeader extends StatelessWidget {
  const LecturerSectionHeader({
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
            color: LecturerColors.primary,
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
                color: LecturerColors.primary,
              ),
            ),
          ),
      ],
    );
  }
}

/// Value + label stat used in dashboard/analytics grids.
class LecturerMiniStat extends StatelessWidget {
  const LecturerMiniStat({super.key, required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceContainer,
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
              color: LecturerColors.primary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

/// Pill used for filter chips on courses / analytics screens.
class LecturerFilterChip extends StatelessWidget {
  const LecturerFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected
              ? LecturerColors.primary
              : LecturerColors.surfaceLowest,
          borderRadius: BorderRadius.circular(999),
          border: selected
              ? null
              : Border.all(color: LecturerColors.outlineVariant),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : LecturerColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

/// Small green "+x%" delta shown next to a stat.
class LecturerDeltaChip extends StatelessWidget {
  const LecturerDeltaChip({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: LecturerColors.successSoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: LecturerColors.success,
        ),
      ),
    );
  }
}

/// Small neutral/label badge for course codes and statuses.
class LecturerTag extends StatelessWidget {
  const LecturerTag({
    super.key,
    required this.label,
    this.variant = SageBadgeVariant.neutral,
  });

  final String label;
  final SageBadgeVariant variant;

  @override
  Widget build(BuildContext context) {
    return SageBadge(label: label, variant: variant, compact: true);
  }
}

/// Lecturer-flavored empty state (matches the Stitch empty illustration layout).
class LecturerEmptyState extends StatelessWidget {
  const LecturerEmptyState({
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
                color: LecturerColors.surfaceContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: LecturerColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
            if (description != null) ...[
              const SizedBox(height: 6),
              Text(
                description!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: LecturerColors.onSurfaceVariant,
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
class LecturerSkeletonBlock extends StatelessWidget {
  const LecturerSkeletonBlock({
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
        color: LecturerColors.surfaceHighest,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
