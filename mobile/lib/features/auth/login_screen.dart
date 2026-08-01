import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/repositories/auth_repository.dart';
import '../onboarding/onboarding_colors.dart';
import 'auth_controller.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Login to SAGE" — Stitch screen `35741edb31994075b74a439801498256`.
/// Email + password card, remember-me, forgot-password and register links.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _remember = false;
  bool _busy = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.isEmpty) {
      _showError('Please enter your email and password.');
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(authControllerProvider.notifier).signIn(
            email: email,
            password: password,
          );
      // Router redirects to the role home once the session is authenticated.
    } on SageAuthException catch (e) {
      _showError(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      headerCentered: true,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 8),
          const Text(
            'Login to your account',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter your credentials to access the academic portal',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: OnboardingColors.outlineVariant),
              borderRadius: BorderRadius.circular(8),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0D2D2E33),
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AuthTextField(
                  label: 'Email Address',
                  icon: Icons.mail_outline,
                  controller: _email,
                  hintText: 'name@university.edu',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Password',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: OnboardingColors.onSurfaceVariant,
                      ),
                    ),
                    AuthTextAction(
                      label: 'Forgot Password?',
                      fontWeight: FontWeight.w600,
                      onPressed: () => context.push('/auth/forgot-password'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                AuthPasswordField(
                  controller: _password,
                  label: '',
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Transform.scale(
                      scale: 0.9,
                      child: Checkbox(
                        value: _remember,
                        activeColor: OnboardingColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        onChanged: (v) =>
                            setState(() => _remember = v ?? false),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'Remember this device',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.2,
                        color: OnboardingColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                AuthPrimaryButton(
                  label: 'Login',
                  isLoading: _busy,
                  onPressed: _submit,
                ),
                const SizedBox(height: 24),
                const Divider(color: OnboardingColors.outlineVariant),
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.center,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Text(
                      "Don't have an account? ",
                      style: TextStyle(
                        fontSize: 14,
                        color: OnboardingColors.onSurfaceVariant,
                      ),
                    ),
                    AuthTextAction(
                      label: 'Register',
                      onPressed: () => context.push('/auth/register'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Demo: use “student”, “lecturer” or “admin” with any password.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: kAuthOutline,
            ),
          ),
          const SizedBox(height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _Dot(color: OnboardingColors.primary),
              SizedBox(width: 16),
              _Dot(color: OnboardingColors.secondaryContainer),
              SizedBox(width: 16),
              _Dot(color: OnboardingColors.primary),
            ],
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
