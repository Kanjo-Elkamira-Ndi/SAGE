import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'onboarding_colors.dart';
import 'onboarding_pages.dart';

/// Recreated from the Stitch "Onboarding" screens (Master Your Curriculum,
/// AI-Powered Assistance, Track Your Growth). Renders the shared SAGE header,
/// a swipeable `PageView`, pagination dots and a Next/Get Started CTA.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _current = 0;

  bool get _isLast => _current == kOnboardingPages.length - 1;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_isLast) {
      context.go('/splash');
      return;
    }
    _controller.nextPage(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OnboardingColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _OnboardingHeader(
              showSkip: !_isLast,
              onSkip: () => context.go('/splash'),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: kOnboardingPages.length,
                onPageChanged: (index) => setState(() => _current = index),
                itemBuilder: (context, index) =>
                    OnboardingPageContent(page: kOnboardingPages[index]),
              ),
            ),
            _PaginationDots(count: kOnboardingPages.length, active: _current),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: OnboardingColors.primary,
                    foregroundColor: OnboardingColors.onPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _isLast ? 'Get Started' : 'Next',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward, size: 20),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Centered SAGE header with the Material school icon and an optional Skip
/// action pinned to the trailing edge.
class _OnboardingHeader extends StatelessWidget {
  const _OnboardingHeader({required this.showSkip, required this.onSkip});

  final bool showSkip;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: OnboardingColors.background,
        border: Border(
          bottom: BorderSide(color: OnboardingColors.outlineVariant),
        ),
      ),
      child: SizedBox(
        height: 60,
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.school,
                  color: OnboardingColors.primary,
                  size: 28,
                ),
                SizedBox(width: 8),
                Text(
                  'SAGE',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: OnboardingColors.primary,
                  ),
                ),
              ],
            ),
            if (showSkip)
              Positioned(
                right: 8,
                child: TextButton(
                  onPressed: onSkip,
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: OnboardingColors.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Active page is a wide primary pill; inactive pages are small grey dots.
class _PaginationDots extends StatelessWidget {
  const _PaginationDots({required this.count, required this.active});

  final int count;
  final int active;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = 0; i < count; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOut,
            width: i == active ? 28 : 8,
            height: 8,
            decoration: BoxDecoration(
              color: i == active
                  ? OnboardingColors.primary
                  : OnboardingColors.outlineVariant,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
        ],
      ],
    );
  }
}
