import 'package:flutter/material.dart';

/// SAGE design tokens per `docs/ui-context.md`.
///
/// Primary — Royal Blue, Secondary — White/Neutral, Accent — Gold,
/// Text — Dark Grey. Semantic colors extend the palette for status/risk
/// signaling (green/amber/red) where brand colors would confuse meaning.
abstract final class AppColors {
  // Primary — Royal Blue
  static const Color primary = Color(0xFF1E3A8A);
  static const Color primaryHover = Color(0xFF16306F);
  static const Color primaryLight = Color(0xFF3B5FCC);
  static const Color primarySubtle = Color(0xFFEEF2FF);

  // Secondary — White / Neutral
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF8F9FB);
  static const Color border = Color(0xFFE4E7EC);

  // Accent — Gold
  static const Color accent = Color(0xFFD4A017);
  static const Color accentHover = Color(0xFFB8890F);
  static const Color accentSubtle = Color(0xFFFBF3DD);

  // Text
  static const Color textPrimary = Color(0xFF2D2E33);
  static const Color textSecondary = Color(0xFF5B5F69);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnAccent = Color(0xFF2D2E33);

  // Semantic
  static const Color success = Color(0xFF1E8E5A);
  static const Color successSubtle = Color(0xFFE7F3EC);
  static const Color warning = Color(0xFFD4A017);
  static const Color warningSubtle = Color(0xFFFBF3DD);
  static const Color danger = Color(0xFFC0362C);
  static const Color dangerSubtle = Color(0xFFF9EAE9);
  static const Color info = Color(0xFF3B5FCC);
  static const Color infoSubtle = Color(0xFFEEF2FF);
}
