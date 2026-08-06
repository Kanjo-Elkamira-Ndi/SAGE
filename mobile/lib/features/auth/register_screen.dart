import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/sage_exception.dart';
import '../../data/models/user.dart';
import '../onboarding/onboarding_colors.dart';
import 'auth_controller.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Register for SAGE" — Stitch screen `3fd59d270e8440d2bd48abfb595779fe`.
/// Full name + email + role + password, with the person_add hero mark.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  Role? _role;
  bool _busy = false;

  @override
  void dispose() {
    _fullName.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_fullName.text.trim().isEmpty) {
      _showError('Please enter your full name.');
      return;
    }
    final email = _email.text.trim();
    if (email.isEmpty) {
      _showError('Please enter your email address.');
      return;
    }
    if (_role == null) {
      _showError('Please select your institutional role.');
      return;
    }
    if (_password.text.isEmpty) {
      _showError('Please enter a password.');
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(authControllerProvider.notifier).register(
            fullName: _fullName.text.trim(),
            email: email,
            password: _password.text,
            role: _role!,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(content: Text('Account created! You can now log in.')),
        );
      context.pushReplacement('/auth/login');
    } on SageException catch (e) {
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
          // Hero mark — person_add in a tinted circle with decorative rings.
          Center(
            child: SizedBox(
              width: 96,
              height: 96,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      color: OnboardingColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 116,
                    height: 116,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: OnboardingColors.primary.withValues(alpha: 0.05),
                      ),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 132,
                    height: 132,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: OnboardingColors.primary.withValues(alpha: 0.1),
                      ),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const Icon(
                    Icons.person_add,
                    size: 48,
                    color: OnboardingColors.primary,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Create your account',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Join the SAGE academic community to manage and excel in your '
            'educational journey.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          Align(
            alignment: Alignment.center,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AuthTextField(
                    label: 'Full Name',
                    icon: Icons.person_outline,
                    controller: _fullName,
                    hintText: 'e.g. Dr. Julian Rivers',
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),
                  AuthTextField(
                    label: 'Email Address',
                    icon: Icons.mail_outline,
                    controller: _email,
                    hintText: 'name@university.edu',
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),
                  _RoleField(
                    value: _role,
                    onChanged: (r) => setState(() => _role = r),
                  ),
                  const SizedBox(height: 16),
                  AuthPasswordField(
                    label: 'Password',
                    controller: _password,
                  ),
                  const SizedBox(height: 24),
                  AuthPrimaryButton(
                    label: 'Register',
                    height: 56,
                    icon: Icons.arrow_forward,
                    isLoading: _busy,
                    onPressed: _submit,
                  ),
                  const SizedBox(height: 24),
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const Text(
                        'Already have an account? ',
                        style: TextStyle(
                          fontSize: 14,
                          color: OnboardingColors.onSurfaceVariant,
                        ),
                      ),
                      AuthTextAction(
                        label: 'Login',
                        onPressed: () => context.pushReplacement('/auth/login'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'BY REGISTERING, YOU AGREE TO OUR\n'
                    'ACADEMIC INTEGRITY POLICY & TERMS OF SERVICE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10,
                      height: 1.6,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                      color: kAuthOutline,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Institutional role select mirroring the native dropdown in the design.
class _RoleField extends StatelessWidget {
  const _RoleField({required this.value, required this.onChanged});

  final Role? value;
  final ValueChanged<Role> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Institutional Role',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: OnboardingColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<Role>(
          initialValue: value,
          isExpanded: true,
          hint: const Text(
            'Select your role',
            style: TextStyle(color: Color(0x80757682)),
          ),
          style: const TextStyle(
            fontSize: 16,
            color: OnboardingColors.onSurface,
          ),
          icon: const Icon(
            Icons.expand_more,
            color: kAuthOutline,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            prefixIcon: const Icon(
              Icons.assignment_ind_outlined,
              size: 20,
              color: kAuthOutline,
            ),
            prefixIconConstraints: const BoxConstraints(minWidth: 44),
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
          items: const [
            DropdownMenuItem(
              value: Role.student,
              child: Text('Student'),
            ),
            DropdownMenuItem(
              value: Role.lecturer,
              child: Text('Lecturer'),
            ),
            DropdownMenuItem(
              value: Role.admin,
              child: Text('Administrator'),
            ),
          ],
          onChanged: (r) {
            if (r != null) onChanged(r);
          },
        ),
      ],
    );
  }
}
