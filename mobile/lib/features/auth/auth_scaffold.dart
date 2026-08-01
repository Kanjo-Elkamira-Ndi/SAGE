import 'package:flutter/material.dart';

import '../onboarding/onboarding_colors.dart';

/// Branded fixed TopAppBar shared by the auth screens, mirroring the Stitch
/// designs: a 64px surface bar with a border, a centered SAGE wordmark, and
/// optional leading/trailing actions.
class AuthHeader extends StatelessWidget {
  const AuthHeader({
    super.key,
    this.leading,
    this.trailing,
    this.centered = false,
  });

  /// Replaces the wordmark slot entirely (e.g. back button + wordmark).
  final Widget? leading;

  /// Pinned to the trailing edge (help / close / school icon).
  final Widget? trailing;

  /// Centered wordmark (login/register) vs. left-aligned wordmark.
  final bool centered;

  Widget _brand(BuildContext context) => const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.school, color: OnboardingColors.primary, size: 24),
          SizedBox(width: 8),
          Text(
            'SAGE',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: OnboardingColors.primary,
            ),
          ),
        ],
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: OnboardingColors.background,
        border: Border(
          bottom: BorderSide(color: OnboardingColors.outlineVariant),
        ),
      ),
      child: centered
          ? Stack(
              alignment: Alignment.center,
              children: [
                _brand(context),
                if (trailing != null)
                  Positioned(
                    right: 0,
                    top: 0,
                    bottom: 0,
                    child: Center(child: trailing),
                  ),
              ],
            )
          : Row(
              children: [
                leading ?? _brand(context),
                const Spacer(),
                ?trailing,
              ],
            ),
    );
  }
}

/// Subtle atmospheric gradient blobs behind auth content (primary/gold tints).
class AuthBackground extends StatelessWidget {
  const AuthBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return const Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          children: [
            Positioned(
              top: -100,
              right: -100,
              child: _Blob(size: 300, color: Color(0x0D00236F)),
            ),
            Positioned(
              bottom: -100,
              left: -100,
              child: _Blob(size: 280, color: Color(0x1AFFC641)),
            ),
          ],
        ),
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

/// Standard auth page layout: fixed header, scrollable padded body, optional
/// footer, over the [AuthBackground].
class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    super.key,
    this.headerLeading,
    this.headerTrailing,
    this.headerCentered = false,
    required this.body,
    this.footer,
  });

  final Widget? headerLeading;
  final Widget? headerTrailing;
  final bool headerCentered;
  final Widget body;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OnboardingColors.background,
      body: Stack(
        children: [
          const AuthBackground(),
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                AuthHeader(
                  leading: headerLeading,
                  trailing: headerTrailing,
                  centered: headerCentered,
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 32, 16, 24),
                    child: body,
                  ),
                ),
                ?footer,
              ],
            ),
          ),
        ],
      ),
    );
  }
}
