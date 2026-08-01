import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../onboarding/onboarding_colors.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Check Your Email" — Stitch screen `321aea603c7841939b0f7381d8bc2b90`.
/// Shown after requesting a reset link; back-to-login + resend actions.
class CheckEmailScreen extends StatefulWidget {
  const CheckEmailScreen({super.key});

  @override
  State<CheckEmailScreen> createState() => _CheckEmailScreenState();
}

class _CheckEmailScreenState extends State<CheckEmailScreen> {
  bool _resending = false;

  void _resend() {
    setState(() => _resending = true);
    Future<void>.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() => _resending = false);
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(content: Text('Reset link sent! Check your inbox.')),
        );
    });
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      headerTrailing: Container(
        width: 40,
        height: 40,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: OnboardingColors.primary.withValues(alpha: 0.05),
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.help_outline,
          size: 20,
          color: OnboardingColors.onSurfaceVariant,
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 8),
          // Mail mark with a soft glow halo.
          Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 144,
                  height: 144,
                  decoration: BoxDecoration(
                    color: OnboardingColors.primary.withValues(alpha: 0.05),
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: OnboardingColors.surfaceContainerHigh,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: OnboardingColors.outlineVariant,
                    ),
                  ),
                  child: const Icon(
                    Icons.mail,
                    size: 48,
                    color: OnboardingColors.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Check your email',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "We've sent password reset instructions to your email.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          AuthPrimaryButton(
            label: 'Back to Login',
            onPressed: () => context.pushReplacement('/auth/login'),
          ),
          const SizedBox(height: 24),
          const Text(
            "Didn't receive the email?",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: _resending
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: OnboardingColors.primary,
                    ),
                  )
                : AuthTextAction(
                    label: 'Resend',
                    fontWeight: FontWeight.w600,
                    onPressed: _resend,
                  ),
          ),
          const SizedBox(height: 48),
          // Decorative bento card — cream-paper photo + skeleton lines.
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: OnboardingColors.surfaceContainer,
              border: Border.all(color: OnboardingColors.outlineVariant),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    'assets/images/auth/check_email_paper.jpg',
                    width: 48,
                    height: 48,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 16),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: OnboardingColors.outlineVariant,
                        borderRadius: BorderRadius.all(Radius.circular(999)),
                      ),
                      child: SizedBox(width: 96, height: 8),
                    ),
                    SizedBox(height: 8),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: Color(0x80757682),
                        borderRadius: BorderRadius.all(Radius.circular(999)),
                      ),
                      child: SizedBox(width: 64, height: 8),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      footer: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: const Text(
          'SECURE ACCESS GATEWAY • SAGE v4.2',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.4,
            color: kAuthOutline,
          ),
        ),
      ),
    );
  }
}
