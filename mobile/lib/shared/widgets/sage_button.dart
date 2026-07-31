import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

enum SageButtonVariant { primary, accent, outline, destructive, ghost }

enum SageButtonSize { small, medium, large }

/// SAGE button with the variants/sizes from `ui-context.md` §4.
class SageButton extends StatelessWidget {
  const SageButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = SageButtonVariant.primary,
    this.size = SageButtonSize.medium,
    this.icon,
    this.fullWidth = false,
    this.isLoading = false,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final SageButtonVariant variant;
  final SageButtonSize size;
  final IconData? icon;
  final bool fullWidth;
  final bool isLoading;

  EdgeInsets get _padding => switch (size) {
        SageButtonSize.small => const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 8,
          ),
        SageButtonSize.medium => const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 12,
          ),
        SageButtonSize.large => const EdgeInsets.symmetric(
            horizontal: 28,
            vertical: 16,
          ),
      };

  double get _fontSize => switch (size) {
        SageButtonSize.small => 13,
        SageButtonSize.medium => 15,
        SageButtonSize.large => 16,
      };

  Widget _buildContent(Widget child) {
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: _fontSize + 2),
          const SizedBox(width: 8),
        ],
        DefaultTextStyle.merge(
          style: TextStyle(
            fontSize: _fontSize,
            fontWeight: FontWeight.w600,
          ),
          child: child,
        ),
      ],
    );
    return fullWidth
        ? Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [content],
          )
        : content;
  }

  Widget _loading() => const SizedBox(
        width: 18,
        height: 18,
        child: CircularProgressIndicator(strokeWidth: 2.5),
      );

  @override
  Widget build(BuildContext context) {
    final child = isLoading ? _loading() : _buildContent(this.child);

    final radius = BorderRadius.circular(10);
    final side = BorderSide(
      color: variant == SageButtonVariant.outline
          ? AppColors.primary
          : variant == SageButtonVariant.destructive
              ? AppColors.danger
              : AppColors.border,
      width: 1.5,
    );

        final style = switch (variant) {
      SageButtonVariant.primary => ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.border
                : AppColors.primary,
          ),
          foregroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.textSecondary
                : AppColors.textOnPrimary,
          ),
          padding: WidgetStatePropertyAll(_padding),
          minimumSize: WidgetStatePropertyAll(
            fullWidth ? const Size(double.infinity, 0) : const Size(0, 0),
          ),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: radius),
          ),
        ),
      SageButtonVariant.accent => ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.border
                : AppColors.accent,
          ),
          foregroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.textSecondary
                : AppColors.textOnAccent,
          ),
          padding: WidgetStatePropertyAll(_padding),
          minimumSize: WidgetStatePropertyAll(
            fullWidth ? const Size(double.infinity, 0) : const Size(0, 0),
          ),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: radius),
          ),
        ),
      SageButtonVariant.destructive => ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.border
                : AppColors.danger,
          ),
          foregroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.textSecondary
                : Colors.white,
          ),
          padding: WidgetStatePropertyAll(_padding),
          minimumSize: WidgetStatePropertyAll(
            fullWidth ? const Size(double.infinity, 0) : const Size(0, 0),
          ),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: radius),
          ),
        ),
      SageButtonVariant.outline => ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.surface
                : Colors.transparent,
          ),
          foregroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.disabled)
                ? AppColors.textSecondary
                : AppColors.primary,
          ),
          side: WidgetStatePropertyAll(side),
          padding: WidgetStatePropertyAll(_padding),
          minimumSize: WidgetStatePropertyAll(
            fullWidth ? const Size(double.infinity, 0) : const Size(0, 0),
          ),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: radius),
          ),
        ),
      SageButtonVariant.ghost => ButtonStyle(
          backgroundColor: WidgetStatePropertyAll(Colors.transparent),
          foregroundColor: WidgetStatePropertyAll(AppColors.primary),
          padding: WidgetStatePropertyAll(_padding),
          minimumSize: WidgetStatePropertyAll(const Size(0, 0)),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: radius),
          ),
        ),
    };

    return switch (variant) {
      SageButtonVariant.ghost => TextButton(
          onPressed: onPressed,
          style: style,
          child: child,
        ),
      SageButtonVariant.outline => OutlinedButton(
          onPressed: onPressed,
          style: style,
          child: child,
        ),
      _ => FilledButton(
          onPressed: onPressed,
          style: style,
          child: child,
        ),
    };
  }
}
