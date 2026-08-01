import 'package:flutter/material.dart';

/// Tokens lifted verbatim from the Stitch "SAGE Design System" splash and
/// onboarding screens (project `20116894548131772`). These extend the brand
/// palette in `app/theme/sage_colors.dart` with the Material-extended tokens
/// the designs were built on, so the mobile launch flow renders 1:1.
abstract final class OnboardingColors {
  // Backgrounds
  static const Color background = Color(0xFFFAF8FF);
  static const Color surfaceContainer = Color(0xFFEEEDF4);
  static const Color surfaceContainerHigh = Color(0xFFE8E7EE);
  static const Color surfaceVariant = Color(0xFFE3E2E8);
  static const Color outlineVariant = Color(0xFFC5C5D3);

  // Primary (Royal Blue family)
  static const Color primary = Color(0xFF00236F);
  static const Color primaryContainer = Color(0xFF1E3A8A);
  static const Color onPrimary = Color(0xFFFFFFFF);

  // Secondary (Gold family)
  static const Color accent = Color(0xFFD4A017);
  static const Color secondary = Color(0xFF795900);
  static const Color secondaryContainer = Color(0xFFFFC641);
  static const Color secondaryFixed = Color(0xFFFFDFA0);
  static const Color onSecondaryFixed = Color(0xFF261A00);
  static const Color tertiaryFixed = Color(0xFFDCE1FF);
  static const Color onTertiaryFixed = Color(0xFF00164F);

  // Text
  static const Color onSurface = Color(0xFF1A1B20);
  static const Color onSurfaceVariant = Color(0xFF444651);

  // Semantic
  static const Color error = Color(0xFFBA1A1A);
  static const Color errorContainer = Color(0xFFFFDAD6);
}
