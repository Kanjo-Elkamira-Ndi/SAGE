import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'onboarding_colors.dart';

/// Branded SAGE splash screen, recreated from the Stitch "SAGE Mobile Splash
/// Screen" design. Shows the identity cluster over a dot-pattern watermark,
/// a bouncing loading indicator, then auto-advances to `/onboarding` once the
/// gold progress bar completes.
class SageSplashScreen extends StatefulWidget {
  const SageSplashScreen({super.key});

  @override
  State<SageSplashScreen> createState() => _SageSplashScreenState();
}

class _SageSplashScreenState extends State<SageSplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _progress;
  late final AnimationController _dots;
  Timer? _navTimer;

  @override
  void initState() {
    super.initState();
    _progress = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..forward();
    _dots = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat();
    _navTimer = Timer(const Duration(milliseconds: 3400), () {
      if (mounted) context.go('/onboarding');
    });
  }

  @override
  void dispose() {
    _navTimer?.cancel();
    _progress.dispose();
    _dots.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OnboardingColors.background,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const CustomPaint(painter: _DotPatternPainter()),
          Positioned(
            top: -90,
            right: -90,
            child: _WatermarkIcon(Icons.school, 320),
          ),
          Positioned(
            bottom: -110,
            left: -110,
            child: _WatermarkIcon(Icons.auto_stories, 280),
          ),
          Center(
            child: AnimatedBuilder(
              animation: _progress,
              builder: (context, _) {
                final t = (_progress.value / 0.35).clamp(0.0, 1.0);
                return Opacity(
                  opacity: Curves.easeOut.transform(t),
                  child: Transform.translate(
                    offset: Offset(0, 14 * (1 - t)),
                    child: const _IdentityCluster(),
                  ),
                );
              },
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 64,
            child: Column(
              children: [
                _BouncingDots(controller: _dots),
                const SizedBox(height: 28),
                const Text(
                  'Precision in Academic Management',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    color: OnboardingColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: AnimatedBuilder(
              animation: _progress,
              builder: (context, _) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(
                      height: 4,
                      child: Stack(
                        children: [
                          Container(color: OnboardingColors.surfaceContainer),
                          FractionallySizedBox(
                            widthFactor: Curves.easeOut.transform(
                              _progress.value,
                            ),
                            child: Container(
                              color: OnboardingColors.secondaryContainer,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// The SAGE wordmark + school icon block.
class _IdentityCluster extends StatelessWidget {
  const _IdentityCluster();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: OnboardingColors.primary.withValues(alpha: 0.05),
              ),
            ),
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: OnboardingColors.primaryContainer,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: OnboardingColors.primary.withValues(alpha: 0.30),
                    blurRadius: 24,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.school,
                color: OnboardingColors.onPrimary,
                size: 54,
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        const Text(
          'SAGE',
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
            color: OnboardingColors.primary,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'SMART ACADEMY GUIDANCE ENGINE',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 2.4,
            color: OnboardingColors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

/// Subtle dot-grid watermark (`radial-gradient` from the design).
class _DotPatternPainter extends CustomPainter {
  const _DotPatternPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = OnboardingColors.surfaceVariant.withValues(alpha: 0.4);
    const spacing = 40.0;
    for (var y = 0.0; y <= size.height; y += spacing) {
      for (var x = 0.0; x <= size.width; x += spacing) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_DotPatternPainter oldDelegate) => false;
}

/// Oversized corner decoration rendered at ~5% opacity.
class _WatermarkIcon extends StatelessWidget {
  const _WatermarkIcon(this.icon, this.size);

  final IconData icon;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Icon(
      icon,
      size: size,
      color: OnboardingColors.primary.withValues(alpha: 0.05),
    );
  }
}

/// The three staggered bouncing dots above the slogan.
class _BouncingDots extends StatelessWidget {
  const _BouncingDots({required this.controller});

  final AnimationController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < 3; i++) ...[
              if (i > 0) const SizedBox(width: 6),
              Transform.translate(
                offset: Offset(
                  0,
                  -4 * math.sin(controller.value * 2 * math.pi + i * math.pi / 2.5),
                ),
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: OnboardingColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}
