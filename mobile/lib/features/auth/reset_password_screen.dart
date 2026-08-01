import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../onboarding/onboarding_colors.dart';
import 'auth_scaffold.dart';
import 'auth_widgets.dart';

/// "Reset Password" — Stitch screen `dfd6d6c2aa6045f3ade7ae5831891dd6`.
/// New + confirm password with the live strength meter and requirement list.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _newPassword = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _obscure = true;
  bool _busy = false;

  int get _strength {
    final pwd = _newPassword.text;
    var s = 0;
    if (pwd.length >= 12) s += 33;
    if (RegExp(r'[A-Z]').hasMatch(pwd) &&
        RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(pwd)) {
      s += 34;
    }
    if (RegExp(r'\d').hasMatch(pwd)) s += 33;
    return s;
  }

  bool get _hasLength => _newPassword.text.length >= 12;
  bool get _hasUpperSpecial =>
      RegExp(r'[A-Z]').hasMatch(_newPassword.text) &&
      RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(_newPassword.text);
  bool get _hasDigit => RegExp(r'\d').hasMatch(_newPassword.text);

  String get _strengthLabel => switch (_strength) {
        < 40 => 'Weak',
        < 90 => 'Moderate',
        _ => 'Secure',
      };

  Color get _strengthColor => switch (_strength) {
        < 40 => const Color(0xFFBA1A1A),
        < 90 => const Color(0xFF5C4300),
        _ => const Color(0xFF795900),
      };

  void _submit() {
    final pwd = _newPassword.text;
    if (pwd.isEmpty) {
      _showError('Please enter a new password.');
      return;
    }
    if (pwd != _confirmPassword.text) {
      _showError('Passwords do not match.');
      return;
    }
    if (_strength < 40) {
      _showError('Password is too weak. See the security requirements.');
      return;
    }
    setState(() => _busy = true);
    Future<void>.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _busy = false);
      context.pushReplacement('/auth/reset-success');
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  void dispose() {
    _newPassword.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

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
          const Text(
            'Reset Password',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter your new security credentials below to regain access to '
            'your academic portal.',
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
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
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _FieldLabel('New Password'),
                const SizedBox(height: 6),
                AuthTextField(
                  label: '',
                  icon: Icons.lock_outline,
                  controller: _newPassword,
                  hintText: '••••••••',
                  obscure: _obscure,
                  onChanged: (_) => setState(() {}),
                  trailing: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      size: 20,
                      color: kAuthOutline,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                _StrengthMeter(
                  value: _strength / 100,
                  label: _strengthLabel,
                  labelColor: _strengthColor,
                ),
                const SizedBox(height: 24),
                const _FieldLabel('Confirm New Password'),
                const SizedBox(height: 6),
                AuthTextField(
                  label: '',
                  icon: Icons.lock_outline,
                  controller: _confirmPassword,
                  hintText: '••••••••',
                  obscure: _obscure,
                  onSubmitted: (_) => _submit(),
                  trailing: const Padding(
                    padding: EdgeInsets.only(right: 12),
                    child: Icon(
                      Icons.lock,
                      size: 20,
                      color: kAuthOutline,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: OnboardingColors.surfaceContainer,
                    border: Border.all(
                      color: OnboardingColors.outlineVariant.withValues(
                        alpha: 0.5,
                      ),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Security Requirements',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: OnboardingColors.primary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _Requirement(
                        met: _hasLength,
                        text: 'Minimum 12 characters',
                      ),
                      const SizedBox(height: 8),
                      _Requirement(
                        met: _hasUpperSpecial,
                        text: 'One uppercase & one special character',
                      ),
                      const SizedBox(height: 8),
                      _Requirement(
                        met: _hasDigit,
                        text: 'Includes at least one numeric digit',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                AuthPrimaryButton(
                  label: 'Update Password',
                  isLoading: _busy,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              const Text(
                'Having trouble? ',
                style: TextStyle(
                  fontSize: 14,
                  color: OnboardingColors.onSurfaceVariant,
                ),
              ),
              AuthTextAction(
                label: 'Contact Faculty Support',
                fontWeight: FontWeight.w600,
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.6,
        color: OnboardingColors.onSurfaceVariant,
      ),
    );
  }
}

/// Gold progress bar + "Password Strength" caption, live-updating.
class _StrengthMeter extends StatelessWidget {
  const _StrengthMeter({
    required this.value,
    required this.label,
    required this.labelColor,
  });

  final double value;
  final String label;
  final Color labelColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Password Strength',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: OnboardingColors.onSurfaceVariant,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: SizedBox(
            height: 4,
            child: Stack(
              children: [
                Container(
                  color: OnboardingColors.surfaceContainerHigh,
                ),
                FractionallySizedBox(
                  widthFactor: value.clamp(0, 1),
                  child: Container(color: OnboardingColors.accent),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Requirement extends StatelessWidget {
  const _Requirement({required this.met, required this.text});

  final bool met;
  final String text;

  @override
  Widget build(BuildContext context) {
    final color = met
        ? const Color(0xFF795900)
        : OnboardingColors.onSurfaceVariant;
    return Row(
      children: [
        Icon(Icons.check_circle, size: 16, color: color),
        const SizedBox(width: 12),
        Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: color,
          ),
        ),
      ],
    );
  }
}
