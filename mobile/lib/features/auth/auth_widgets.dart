import 'package:flutter/material.dart';

import '../onboarding/onboarding_colors.dart';

/// Neutral `outline` token the designs pair with `outline-variant`.
const Color kAuthOutline = Color(0xFF757682);

/// Label above an icon-leading input, matching the Stitch auth fields:
/// white fill, 1px outline-variant border, 8px radius, 48px tap height.
class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.label,
    required this.icon,
    this.controller,
    this.hintText,
    this.obscure = false,
    this.trailing,
    this.keyboardType,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
  });

  final String label;
  final IconData icon;
  final TextEditingController? controller;
  final String? hintText;
  final bool obscure;
  final Widget? trailing;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: OnboardingColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          onChanged: onChanged,
          onSubmitted: onSubmitted,
          style: const TextStyle(
            fontSize: 16,
            color: OnboardingColors.onSurface,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: const TextStyle(color: Color(0x80757682)),
            filled: true,
            fillColor: Colors.white,
            prefixIcon: Icon(icon, size: 20, color: kAuthOutline),
            prefixIconConstraints: const BoxConstraints(minWidth: 44),
            suffixIcon: trailing,
            suffixIconConstraints: const BoxConstraints(minWidth: 44),
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: OnboardingColors.outlineVariant,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: OnboardingColors.primary,
                width: 2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Password field with the visibility toggle micro-interaction from the designs.
class AuthPasswordField extends StatefulWidget {
  const AuthPasswordField({
    super.key,
    required this.label,
    this.controller,
    this.hintText = '••••••••',
    this.onChanged,
    this.onSubmitted,
  });

  final String label;
  final TextEditingController? controller;
  final String? hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<AuthPasswordField> createState() => _AuthPasswordFieldState();
}

class _AuthPasswordFieldState extends State<AuthPasswordField> {
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return AuthTextField(
      label: widget.label,
      icon: Icons.lock_outline,
      controller: widget.controller,
      hintText: widget.hintText,
      obscure: !_visible,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      trailing: IconButton(
        onPressed: () => setState(() => _visible = !_visible),
        icon: Icon(
          _visible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          size: 20,
          color: kAuthOutline,
        ),
      ),
    );
  }
}

/// Full-width primary CTA from the designs (Royal Blue #00236F, 8px radius).
class AuthPrimaryButton extends StatelessWidget {
  const AuthPrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.height = 52,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: FilledButton(
        onPressed: isLoading ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: OnboardingColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: OnboardingColors.primary.withValues(alpha: 0.6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        child: isLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Text(label),
                ],
              ),
      ),
    );
  }
}

/// Full-width outline CTA (transparent, primary border/text).
class AuthOutlineButton extends StatelessWidget {
  const AuthOutlineButton({
    super.key,
    required this.label,
    this.onPressed,
    this.height = 48,
  });

  final String label;
  final VoidCallback? onPressed;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: OnboardingColors.primary,
          side: const BorderSide(color: OnboardingColors.outlineVariant),
          backgroundColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        child: Text(label),
      ),
    );
  }
}

/// Underlined text action ("Forgot Password?", "Register", "Back to Login").
class AuthTextAction extends StatelessWidget {
  const AuthTextAction({
    super.key,
    required this.label,
    required this.onPressed,
    this.fontWeight = FontWeight.w700,
    this.color = OnboardingColors.primary,
  });

  final String label;
  final VoidCallback onPressed;
  final FontWeight fontWeight;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        textStyle: TextStyle(
          fontSize: 14,
          fontWeight: fontWeight,
          decoration: TextDecoration.underline,
          decorationThickness: 1,
          decorationColor: color,
        ),
      ),
      child: Text(label),
    );
  }
}
