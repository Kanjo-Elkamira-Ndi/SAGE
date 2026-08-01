import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

/// Flat, clean card matching the SAGE design brief — white surface, 1px border,
/// rounded corners, no heavy shadows.
class SageCard extends StatelessWidget {
  const SageCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.highlighted = false,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  /// Overrides the card background (defaults to white).
  final Color? color;

  /// Adds a primary left accent border — used for unread/highlighted items.
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(12);
    final border = Border(
      left: highlighted ? const BorderSide(color: AppColors.primary, width: 4) : BorderSide.none,
      top: const BorderSide(color: AppColors.border, width: 1),
      right: const BorderSide(color: AppColors.border, width: 1),
      bottom: const BorderSide(color: AppColors.border, width: 1),
    );

    // A transparent Material hosts the child (and tap ripple), so ListTiles
    // and ink splashes inside the card are always visible.
    final body = Material(
      color: Colors.transparent,
      borderRadius: radius,
      clipBehavior: Clip.antiAlias,
      child: onTap != null
          ? InkWell(
              onTap: onTap,
              child: Padding(
                padding: padding ?? const EdgeInsets.all(16),
                child: child,
              ),
            )
          : Padding(
              padding: padding ?? const EdgeInsets.all(16),
              child: child,
            ),
    );

    return Container(
      decoration: BoxDecoration(
        color: color ?? AppColors.background,
        borderRadius: radius,
        border: border,
      ),
      child: body,
    );
  }
}
