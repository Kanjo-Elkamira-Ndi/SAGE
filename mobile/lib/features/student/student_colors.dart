import 'package:flutter/material.dart';

/// Token set lifted verbatim from the Stitch "SAGE — Student App" screens
/// (project `20116894548131772`). Extends the onboarding palette with the full
/// Material-extended surface/outline scales and the secondary (gold) and
/// tertiary (periwinkle) families the student module renders.
abstract final class StudentColors {
  // Backgrounds / surfaces
  static const Color background = Color(0xFFFAF8FF);
  static const Color surfaceLowest = Color(0xFFFFFFFF);
  static const Color surfaceLow = Color(0xFFF4F3F9);
  static const Color surfaceContainer = Color(0xFFEEEDF4);
  static const Color surfaceHigh = Color(0xFFE8E7EE);
  static const Color surfaceHighest = Color(0xFFE3E2E8);

  // Primary (Royal Blue family)
  static const Color primary = Color(0xFF00236F);
  static const Color primaryContainer = Color(0xFF1E3A8A);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryContainer = Color(0xFF90A8FF);

  // Secondary (Gold family)
  static const Color secondary = Color(0xFF795900);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color secondaryContainer = Color(0xFFFFC641);
  static const Color onSecondaryContainer = Color(0xFF715300);
  static const Color secondaryFixed = Color(0xFFFFDFA0);
  static const Color secondaryFixedDim = Color(0xFFF6BE39);

  // Tertiary (Periwinkle family)
  static const Color tertiary = Color(0xFF00226F);
  static const Color tertiaryContainer = Color(0xFF0035A0);
  static const Color tertiaryFixed = Color(0xFFDCE1FF);
  static const Color onTertiaryFixed = Color(0xFF00164F);
  static const Color tertiaryFixedDim = Color(0xFFB6C4FF);

  // Text / outlines
  static const Color onSurface = Color(0xFF1A1B20);
  static const Color onSurfaceVariant = Color(0xFF444651);
  static const Color outline = Color(0xFF757682);
  static const Color outlineVariant = Color(0xFFC5C5D3);

  // Semantic
  static const Color error = Color(0xFFBA1A1A);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color errorContainer = Color(0xFFFFDAD6);
  static const Color onErrorContainer = Color(0xFF93000A);
  static const Color success = Color(0xFF008544);
  static const Color successSoft = Color(0xFFE6F4EA);
  static const Color onSuccessSoft = Color(0xFF00391C);
  static const Color academicGold = Color(0xFFD4A017);

  // Shared layout rhythm (maps the Stitch `spacing` scale).
  static const double gutter = 24;
  static const double stackSm = 8;
  static const double stackMd = 16;
  static const double stackLg = 32;
}
