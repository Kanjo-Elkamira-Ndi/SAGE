import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'onboarding_colors.dart';

/// Model for one onboarding step (text + illustration), mirroring the
/// corresponding Stitch screens.
class OnboardingPage {
  const OnboardingPage({
    required this.title,
    required this.description,
    required this.illustration,
  });

  final String title;
  final String description;
  final Widget illustration;
}

/// The three onboarding steps in design order:
/// 1. Master Your Curriculum → 2. AI-Powered Assistance → 3. Track Your Growth.
const kOnboardingPages = [
  OnboardingPage(
    title: 'Master Your Curriculum',
    description:
        'Access course materials, schedules, and assignments in one unified workspace.',
    illustration: _CurriculumIllustration(),
  ),
  OnboardingPage(
    title: 'AI-Powered Assistance',
    description:
        'Get personalized study plans, instant grading summaries, and administrative help from SAGE Assistant.',
    illustration: _AiIllustration(),
  ),
  OnboardingPage(
    title: 'Track Your Growth',
    description:
        'Visualize your performance with precision analytics and stay ahead with at-risk alerts.',
    illustration: _GrowthIllustration(),
  ),
];

/// Shared content column used by every step.
class OnboardingPageContent extends StatelessWidget {
  const OnboardingPageContent({super.key, required this.page});

  final OnboardingPage page;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 360),
                child: page.illustration,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            page.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              height: 1.3,
              color: OnboardingColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            page.description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              height: 1.6,
              color: OnboardingColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

/// Step 1 — a tilted "course card" with a gold progress bar, a floating
/// schedule chip and a pending-assignments chip.
class _CurriculumIllustration extends StatelessWidget {
  const _CurriculumIllustration();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: OnboardingColors.primary.withValues(alpha: 0.05),
          ),
        ),
        Positioned.fill(
          child: Opacity(
            opacity: 0.30,
            child: Image.asset(
              'assets/images/onboarding/curriculum_bg.jpg',
              fit: BoxFit.contain,
            ),
          ),
        ),
        Transform.rotate(
          angle: -0.0524,
          child: Container(
            width: 232,
            height: 292,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: OnboardingColors.outlineVariant),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2D2E33).withValues(alpha: 0.10),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                FractionallySizedBox(
                  widthFactor: 0.75,
                  child: Container(
                    height: 8,
                    color: OnboardingColors.accent,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: OnboardingColors.primaryContainer
                              .withValues(alpha: 0.10),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.menu_book,
                          color: OnboardingColors.primary,
                          size: 24,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _skeleton(full: true),
                      const SizedBox(height: 12),
                      _skeleton(),
                      const SizedBox(height: 32),
                      _curriculumDotRow(opacity: 1.0, barWidth: 96),
                      const SizedBox(height: 8),
                      _curriculumDotRow(opacity: 0.5, barWidth: 128),
                      const SizedBox(height: 8),
                      _curriculumDotRow(opacity: 0.25, barWidth: 64),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: 0,
          right: 0,
          child: _FloatingCard(
            phase: math.pi,
            child: _scheduleCard(),
          ),
        ),
        Positioned(
          bottom: 28,
          left: -12,
          child: _FloatingCard(
            phase: math.pi * 1.8,
            child: _assignmentsCard(),
          ),
        ),
      ],
    );
  }

  Widget _skeleton({bool full = false}) => FractionallySizedBox(
        widthFactor: full ? 1 : 0.83,
        child: Container(
          height: 16,
          decoration: BoxDecoration(
            color: OnboardingColors.surfaceContainerHigh,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      );

  Widget _curriculumDotRow({required double opacity, required double barWidth}) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: OnboardingColors.secondary.withValues(alpha: opacity),
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12),
        Container(
          width: barWidth,
          height: 8,
          decoration: BoxDecoration(
            color: OnboardingColors.surfaceVariant,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ],
    );
  }

  Widget _scheduleCard() => _FloatCardContent(
        icon: Icons.calendar_today,
        iconColor: OnboardingColors.secondary,
        label: 'Schedule',
        value: '09:00 AM',
      );

  Widget _assignmentsCard() => _FloatCardContent(
        icon: Icons.assignment_turned_in,
        iconColor: OnboardingColors.primary,
        label: 'Assignments',
        value: '4 Pending',
      );
}

/// Step 2 — an AI orb with SAGE Assistant / Active chips and floating tool
/// chips on a soft two-color gradient backdrop.
class _AiIllustration extends StatelessWidget {
  const _AiIllustration();

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: OnboardingColors.outlineVariant),
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned(
              top: -80,
              left: -80,
              child: _blob(OnboardingColors.primary),
            ),
            Positioned(
              bottom: -80,
              right: -80,
              child: _blob(OnboardingColors.secondaryContainer),
            ),
            Center(
              child: _FloatingCard(
                phase: 0,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 128,
                      height: 128,
                      decoration: BoxDecoration(
                        color: OnboardingColors.primaryContainer,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: OnboardingColors.primary
                                .withValues(alpha: 0.10),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.smart_toy,
                        color: OnboardingColors.onPrimary,
                        size: 62,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Wrap(
                      spacing: 8,
                      alignment: WrapAlignment.center,
                      children: const [
                        _Pill(
                          label: 'SAGE Assistant',
                          background: OnboardingColors.secondaryFixed,
                          foreground: OnboardingColors.onSecondaryFixed,
                        ),
                        _Pill(
                          label: 'Active',
                          background: OnboardingColors.tertiaryFixed,
                          foreground: OnboardingColors.onTertiaryFixed,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              left: 12,
              top: 108,
              child: _FloatingCard(
                phase: math.pi * 0.8,
                child: _bentoCell(Icons.psychology, OnboardingColors.primary),
              ),
            ),
            Positioned(
              right: 12,
              top: 108,
              child: _FloatingCard(
                phase: math.pi * 1.6,
                child: _bentoCell(
                  Icons.assignment,
                  OnboardingColors.secondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _blob(Color color) => Container(
        width: 220,
        height: 220,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              color.withValues(alpha: 0.12),
              color.withValues(alpha: 0.0),
            ],
          ),
        ),
      );

  Widget _bentoCell(IconData icon, Color color) => Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFE4E7EC)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2D2E33).withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: 22),
      );
}

/// Step 3 — a GPA ring with a gold progress arc, a mini trend chart and an
/// at-risk alert chip.
class _GrowthIllustration extends StatelessWidget {
  const _GrowthIllustration();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: OnboardingColors.primary.withValues(alpha: 0.05),
          ),
        ),
        _FloatingCard(
          phase: 0,
          child: Container(
            width: 240,
            height: 240,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.70),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFE4E7EC).withValues(alpha: 0.5),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2D2E33).withValues(alpha: 0.12),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const SizedBox.expand(
                  child: CustomPaint(painter: _GpaRingPainter()),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      '3.8',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w700,
                        color: OnboardingColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'GPA INDEX',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 2,
                        color: OnboardingColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: 0,
          right: -6,
          child: _FloatingCard(
            phase: math.pi * 0.6,
            child: _trendCard(),
          ),
        ),
        Positioned(
          bottom: 16,
          left: -10,
          child: _FloatingCard(
            phase: math.pi * 1.4,
            child: _riskCard(),
          ),
        ),
      ],
    );
  }

  Widget _trendCard() => Container(
        padding: const EdgeInsets.all(16),
        decoration: _cardDecoration,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.trending_up,
                  color: OnboardingColors.secondary,
                  size: 20,
                ),
                SizedBox(width: 8),
                Text(
                  'Growth',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: OnboardingColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (final (alpha, h) in const [
                  (0.20, 16.0),
                  (0.30, 24.0),
                  (0.40, 20.0),
                  (0.60, 36.0),
                  (1.00, 48.0),
                ]) ...[
                  if (alpha != 0.20) const SizedBox(width: 6),
                  Container(
                    width: 12,
                    height: h,
                    decoration: BoxDecoration(
                      color: OnboardingColors.primary.withValues(alpha: alpha),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(2),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      );

  Widget _riskCard() => IntrinsicHeight(
        child: Container(
          padding: const EdgeInsets.fromLTRB(0, 12, 12, 12),
          decoration: _cardDecoration,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 4,
                margin: const EdgeInsets.only(right: 12),
                decoration: const BoxDecoration(
                  color: OnboardingColors.error,
                  borderRadius: BorderRadius.horizontal(
                    left: Radius.circular(12),
                  ),
                ),
              ),
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: OnboardingColors.errorContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.notification_important,
                  color: OnboardingColors.error,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Physics Quiz',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: OnboardingColors.onSurface,
                    ),
                  ),
                  Text(
                    'At-risk alert',
                    style: TextStyle(
                      fontSize: 12,
                      color: OnboardingColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );

  static final BoxDecoration _cardDecoration = BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: OnboardingColors.outlineVariant),
    boxShadow: [
      BoxShadow(
        color: const Color(0xFF2D2E33).withValues(alpha: 0.08),
        blurRadius: 12,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

/// Small glass chip shared by floating cards.
class _FloatCardContent extends StatelessWidget {
  const _FloatCardContent({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: OnboardingColors.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2D2E33).withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: OnboardingColors.onSurface,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 12,
                  color: OnboardingColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// White rounded floating card with a slow vertical bob.
class _FloatingCard extends StatefulWidget {
  const _FloatingCard({required this.child, required this.phase});

  final Widget child;
  final double phase;

  @override
  State<_FloatingCard> createState() => _FloatingCardState();
}

class _FloatingCardState extends State<_FloatingCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final dy = math.sin(_controller.value * 2 * math.pi + widget.phase) *
            10;
        return Transform.translate(offset: Offset(0, dy), child: child);
      },
      child: widget.child,
    );
  }
}

/// GPA ring: grey track + gold progress arc (~81% from the design).
class _GpaRingPainter extends CustomPainter {
  const _GpaRingPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 20;
    const stroke = StrokeCap.butt;

    final track = Paint()
      ..color = OnboardingColors.surfaceContainerHigh
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = stroke;
    canvas.drawCircle(center, radius, track);

    final progress = Paint()
      ..color = OnboardingColors.secondary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = stroke;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * 0.809,
      false,
      progress,
    );
  }

  @override
  bool shouldRepaint(_GpaRingPainter oldDelegate) => false;
}

/// Small rounded badge used by the AI step chips.
class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.background,
    required this.foreground,
  });

  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: foreground,
        ),
      ),
    );
  }
}
