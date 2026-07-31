import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

/// Circular progress ring (e.g. course completion, quiz score).
/// Gold fill on a light track; the numeric label sits in the center.
class SageCircularProgress extends StatelessWidget {
  const SageCircularProgress({
    super.key,
    required this.value,
    this.size = 96,
    this.strokeWidth = 8,
    this.color = AppColors.accent,
    this.label,
    this.subLabel,
  });

  /// 0.0 – 1.0
  final double value;
  final double size;
  final double strokeWidth;
  final Color color;
  final String? label;
  final String? subLabel;

  @override
  Widget build(BuildContext context) {
    final clamped = value.clamp(0.0, 1.0);

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: clamped,
              strokeWidth: strokeWidth,
              strokeCap: StrokeCap.round,
              backgroundColor: AppColors.border,
              color: color,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (label != null)
                Text(
                  label!,
                  style: TextStyle(
                    fontSize: size * 0.24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                    height: 1,
                  ),
                ),
              if (subLabel != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    subLabel!,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
