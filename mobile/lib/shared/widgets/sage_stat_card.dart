import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';
import 'sage_card.dart';

/// KPI tile used across dashboards (counts, averages, scores).
class SageStatCard extends StatelessWidget {
  const SageStatCard({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    this.description,
    this.iconColor,
    this.iconBackground,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final String? description;
  final Color? iconColor;
  final Color? iconBackground;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SageCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconBackground ?? AppColors.primarySubtle,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              size: 22,
              color: iconColor ?? AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          if (description != null) ...[
            const SizedBox(height: 2),
            Text(
              description!,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
