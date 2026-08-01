import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../onboarding/onboarding_colors.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Reset Link Expired" — Stitch screen `699ce1d050df42aa9c3e5c20cc93a6ec`.
/// Bento focal card over the campus hallway photo, request-new-link actions.
class ResetLinkExpiredScreen extends StatelessWidget {
  const ResetLinkExpiredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      headerTrailing: IconButton(
        onPressed: () => context.pop(),
        icon: const Icon(
          Icons.close,
          color: OnboardingColors.onSurfaceVariant,
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Bento focal point: hallway photo + floating warning badge.
          Center(
            child: SizedBox(
              width: 280,
              height: 280,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 264,
                    height: 264,
                    decoration: BoxDecoration(
                      color: OnboardingColors.secondaryContainer.withValues(
                        alpha: 0.1,
                      ),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: OnboardingColors.outlineVariant,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0D2D2E33),
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(11),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Opacity(
                            opacity: 0.4,
                            child: Image.asset(
                              'assets/images/auth/campus_hallway.jpg',
                              fit: BoxFit.cover,
                            ),
                          ),
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: OnboardingColors.outlineVariant,
                                ),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x332D2E33),
                                    blurRadius: 16,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.warning_amber_rounded,
                                size: 64,
                                color: Color(0xFF795900),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Reset Link Expired',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'The password reset link has expired or has already been used. '
            'Please request a new one.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          AuthPrimaryButton(
            label: 'Request New Link',
            icon: Icons.arrow_forward,
            onPressed: () => context.pushReplacement('/auth/forgot-password'),
          ),
          const SizedBox(height: 12),
          AuthOutlineButton(
            label: 'Back to Login',
            onPressed: () => context.pushReplacement('/auth/login'),
          ),
          const SizedBox(height: 48),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: OnboardingColors.surfaceContainer,
              border: Border.all(color: OnboardingColors.outlineVariant),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.help_outline,
                  size: 16,
                  color: OnboardingColors.onSurfaceVariant,
                ),
                SizedBox(width: 8),
                Text(
                  'Need help? Contact academic support',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: OnboardingColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      footer: const Padding(
        padding: EdgeInsets.only(bottom: 16),
        child: Text(
          'POWERED BY SAGE ACADEMIC OS',
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
