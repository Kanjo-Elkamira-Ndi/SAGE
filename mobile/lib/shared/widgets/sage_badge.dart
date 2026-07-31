import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

enum SageBadgeVariant {
  primary,
  accent,
  success,
  warning,
  danger,
  info,
  neutral,
  outline,
}

/// Small status/label chip. Tinted background + tinted foreground per variant,
/// following the "fill not text" rule for gold.
class SageBadge extends StatelessWidget {
  const SageBadge({
    super.key,
    required this.label,
    this.variant = SageBadgeVariant.neutral,
    this.icon,
    this.compact = false,
  });

  final String label;
  final SageBadgeVariant variant;
  final IconData? icon;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (variant) {
      SageBadgeVariant.primary => (AppColors.primarySubtle, AppColors.primary),
      SageBadgeVariant.accent => (AppColors.accentSubtle, AppColors.accentHover),
      SageBadgeVariant.success => (AppColors.successSubtle, AppColors.success),
      SageBadgeVariant.warning => (AppColors.warningSubtle, AppColors.accentHover),
      SageBadgeVariant.danger => (AppColors.dangerSubtle, AppColors.danger),
      SageBadgeVariant.info => (AppColors.infoSubtle, AppColors.info),
      SageBadgeVariant.neutral => (AppColors.surface, AppColors.textSecondary),
      SageBadgeVariant.outline => (Colors.transparent, AppColors.primary),
    };

    return Container(
      padding: compact
          ? const EdgeInsets.symmetric(horizontal: 8, vertical: 2)
          : const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: variant == SageBadgeVariant.outline
            ? Border.all(color: AppColors.primary, width: 1.2)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: compact ? 10 : 12,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
