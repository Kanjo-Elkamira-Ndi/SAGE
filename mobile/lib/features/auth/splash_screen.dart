import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_button.dart';
import 'auth_controller.dart';

/// Branded splash shown while a session is restored and used as the auth gate.
/// Phase 2 replaces the role-preview buttons with the real login/register flows.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authControllerProvider.notifier).restore();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Brand monogram — Royal Blue "S" with a gold dot (ui-context §6)
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Text(
                        'S',
                        style: TextStyle(
                          fontSize: 52,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Positioned(
                      right: -4,
                      bottom: -4,
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.background,
                            width: 4,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Text(
                  'SAGE',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Smart Academy Guidance Engine',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 48),
                if (auth.status == AuthStatus.restoring)
                  const CircularProgressIndicator()
                else ...[
                  const Text(
                    'Access the academic portal',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SageButton(
                    fullWidth: true,
                    size: SageButtonSize.large,
                    onPressed: () => context.push('/auth/login'),
                    child: const Text('Login'),
                  ),
                  const SizedBox(height: 12),
                  SageButton(
                    fullWidth: true,
                    size: SageButtonSize.large,
                    variant: SageButtonVariant.outline,
                    onPressed: () => context.push('/auth/register'),
                    child: const Text('Create Account'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
