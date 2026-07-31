import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

/// Linear progress bar. Gold fill on a light track per `ui-context.md` §4 —
/// the default matches the brand; pass [color] for semantic fills (e.g.
/// green/red for scores).
class SageProgressBar extends StatelessWidget {
  const SageProgressBar({
    super.key,
    required this.value,
    this.label,
    this.showPercent = true,
    this.color,
    this.height = 8,
  });

  /// 0.0 – 1.0
  final double value;
  final String? label;
  final bool showPercent;
  final Color? color;
  final double height;

  @override
  Widget build(BuildContext context) {
    final clamped = value.clamp(0.0, 1.0);
    final percent = (clamped * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null || showPercent)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (label != null)
                  Text(
                    label!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  )
                else
                  const SizedBox.shrink(),
                if (showPercent)
                  Text(
                    '$percent%',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: clamped,
            minHeight: height,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation(
              color ?? AppColors.accent,
            ),
          ),
        ),
      ],
    );
  }
}
