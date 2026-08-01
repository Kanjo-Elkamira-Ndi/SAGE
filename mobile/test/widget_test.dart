import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/app/app.dart';
import 'package:mobile/app/theme/sage_colors.dart';

/// Advances the fake clock far enough for the splash's 3s progress + 3.4s
/// auto-navigation to fire, then pumps one more frame for the route swap.
Future<void> passSplash(WidgetTester tester) async {
  await tester.pump(const Duration(seconds: 4));
  await tester.pump();
}

/// Taps a CTA and lets the 350ms PageView transition settle (the
/// `onPageChanged` setState needs a follow-up frame to rebuild the pages).
Future<void> advanceOnboarding(WidgetTester tester, String label) async {
  await tester.tap(find.text(label));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 400));
  await tester.pump();
}

/// Walks the launch flow: splash → onboarding pages 1..3 → auth gate.
Future<void> reachAuthGate(WidgetTester tester) async {
  await passSplash(tester);
  await advanceOnboarding(tester, 'Next');
  await advanceOnboarding(tester, 'Next');
  await advanceOnboarding(tester, 'Get Started');
  await tester.pump(const Duration(milliseconds: 600));
}

void main() {
  testWidgets('brand tokens match the documented palette', (tester) async {
    expect(AppColors.primary, const Color(0xFF1E3A8A));
    expect(AppColors.accent, const Color(0xFFD4A017));
    expect(AppColors.textPrimary, const Color(0xFF2D2E33));
    expect(AppColors.surface, const Color(0xFFF8F9FB));
  });

  testWidgets('app boots to the branded splash then advances to onboarding',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    expect(find.text('SAGE'), findsOneWidget);
    expect(find.text('Precision in Academic Management'), findsOneWidget);

    await passSplash(tester);

    expect(find.text('Master Your Curriculum'), findsOneWidget);
    expect(find.text('AI-Powered Assistance'), findsNothing);
    expect(find.text('Track Your Growth'), findsNothing);
  });

  testWidgets('onboarding flows through all pages and into the auth gate',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await passSplash(tester);
    expect(find.text('Master Your Curriculum'), findsOneWidget);
    expect(find.text('Skip'), findsOneWidget);

    await advanceOnboarding(tester, 'Next');
    expect(find.text('AI-Powered Assistance'), findsOneWidget);

    await advanceOnboarding(tester, 'Next');
    expect(find.text('Track Your Growth'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);
    expect(find.text('Skip'), findsNothing);

    await tester.tap(find.text('Get Started'));
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpAndSettle();

    expect(find.text('Continue as Student'), findsOneWidget);
    expect(find.text('Continue as Lecturer'), findsOneWidget);
  });

  testWidgets('signing in as student lands on the student shell',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await reachAuthGate(tester);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Continue as Student'));
    await tester.pumpAndSettle();

    expect(find.text('Good morning, Alex!'), findsOneWidget);
    expect(find.text('Academic Portal'), findsOneWidget);
    expect(find.text('Active Courses'), findsOneWidget);
  });
}
