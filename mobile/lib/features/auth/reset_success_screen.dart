import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../onboarding/onboarding_colors.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Reset Success" — Stitch screen `ba05eec46a9c4a358a1eba8b40e0481c`.
/// Centered success card with the bouncing check badge → go to login.
class ResetSuccessScreen extends StatelessWidget {
  const ResetSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: OnboardingColors.outlineVariant),
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0D2D2E33),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Bouncing success badge.
              const Center(
                child: _SuccessBadge(),
              ),
              const SizedBox(height: 32),
              const Text(
                'Password Reset Successful',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: OnboardingColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Your password has been successfully updated. You can now '
                'log in with your new credentials.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  height: 1.6,
                  color: OnboardingColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 32),
              AuthPrimaryButton(
                label: 'Go to Login',
                icon: Icons.arrow_forward,
                onPressed: () => context.pushReplacement('/auth/login'),
              ),
              const SizedBox(height: 32),
              const Divider(
                color: Color(0x4DC5C5D3),
              ),
              const SizedBox(height: 16),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.lock_outline,
                    size: 16,
                    color: kAuthOutline,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'SECURE ACCESS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.4,
                      color: kAuthOutline,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Two-ring success check with the gentle bounce loop from the design.
class _SuccessBadge extends StatefulWidget {
  const _SuccessBadge();

  @override
  State<_SuccessBadge> createState() => _SuccessBadgeState();
}

class _SuccessBadgeState extends State<_SuccessBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween<double>(begin: 1.0, end: 1.08).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
      ),
      child: Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: OnboardingColors.primary.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: Container(
          width: 64,
          height: 64,
          decoration: const BoxDecoration(
            color: OnboardingColors.primary,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Color(0x3D00236F),
                blurRadius: 16,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.check, size: 36, color: Colors.white),
        ),
      ),
    );
  }
}
