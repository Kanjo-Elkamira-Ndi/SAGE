import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../onboarding/onboarding_colors.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Forgot Password" — Stitch screen `25ab1844a49640ec997b8dce101f4a2d`.
/// Email capture → "Send Reset Link" → check-email state.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_email.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(content: Text('Please enter your email address.')),
        );
      return;
    }
    setState(() => _busy = true);
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _busy = false);
    context.push('/auth/check-email');
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      headerLeading: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(
              Icons.arrow_back,
              color: OnboardingColors.primary,
            ),
          ),
          const Text(
            'SAGE',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: OnboardingColors.primary,
            ),
          ),
        ],
      ),
      headerTrailing: const Icon(
        Icons.school,
        color: OnboardingColors.primary,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: OnboardingColors.surfaceContainerHigh,
                border: Border.all(color: OnboardingColors.outlineVariant),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.lock_reset,
                size: 36,
                color: OnboardingColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Forgot Password?',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Enter your email address and we'll send you a link to reset "
            'your password.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          AuthTextField(
            label: 'Email Address',
            icon: Icons.mail_outline,
            controller: _email,
            hintText: 'name@university.edu',
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => _send(),
          ),
          const SizedBox(height: 16),
          AuthPrimaryButton(
            label: 'Send Reset Link',
            icon: Icons.send,
            isLoading: _busy,
            onPressed: _send,
          ),
          const SizedBox(height: 32),
          Center(
            child: AuthTextAction(
              label: 'Back to Login',
              fontWeight: FontWeight.w500,
              onPressed: () => context.pushReplacement('/auth/login'),
            ),
          ),
          const SizedBox(height: 48),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.menu_book, size: 40, color: kAuthOutline),
              SizedBox(width: 16),
              Icon(Icons.workspace_premium, size: 40, color: kAuthOutline),
              SizedBox(width: 16),
              Icon(Icons.history_edu, size: 40, color: kAuthOutline),
            ],
          ),
        ],
      ),
    );
  }
}
