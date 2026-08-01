import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/app/app.dart';
import 'package:mobile/app/theme/sage_colors.dart';
import 'package:mobile/data/models/user.dart';

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

/// Field finder by hint text (the login/register inputs are unlabeled).
Finder fieldWithHint(String hint) => find.byWidgetPredicate(
      (w) => w is TextField && w.decoration?.hintText == hint,
    );

/// Opens the login screen from the auth gate and signs in as the demo student.
Future<void> signInAsStudent(WidgetTester tester) async {
  await reachAuthGate(tester);
  await tester.pumpAndSettle();

  await tester.tap(find.text('Login'));
  await tester.pumpAndSettle();

  await tester.enterText(fieldWithHint('name@university.edu'), 'student');
  await tester.enterText(fieldWithHint('••••••••'), 'demo');
  await tester.ensureVisible(find.text('Login'));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Login'));
  await tester.pumpAndSettle();
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

    expect(find.text('Continue as Student'), findsNothing);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);
  });

  testWidgets('signing in as student lands on the student shell',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await signInAsStudent(tester);

    expect(find.text('Good morning, Alex!'), findsOneWidget);
    expect(find.text('Academic Portal'), findsOneWidget);
    expect(find.text('Active Courses'), findsOneWidget);
  });

  testWidgets('invalid credentials surface the auth error', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await reachAuthGate(tester);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    await tester.enterText(fieldWithHint('name@university.edu'), 'nobody');
    await tester.enterText(fieldWithHint('••••••••'), 'x');
    await tester.ensureVisible(find.text('Login'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Login'));
    await tester.pump();

    expect(find.text('No account found for that email.'), findsOneWidget);
    await tester.pump(const Duration(seconds: 5));
  });

  testWidgets('registering routes back to login after account creation',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await reachAuthGate(tester);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Create Account'));
    await tester.pumpAndSettle();

    expect(find.text('Create your account'), findsOneWidget);

    await tester.enterText(fieldWithHint('e.g. Dr. Julian Rivers'), 'Jordan Lee');
    await tester.enterText(
        fieldWithHint('name@university.edu'), 'jordan.lee@student.sage.edu');
    await tester.enterText(fieldWithHint('••••••••'), 'sage-password-1');

    final roleField = find.byType(DropdownButtonFormField<Role>);
    await tester.ensureVisible(roleField);
    await tester.pumpAndSettle();
    await tester.tap(roleField);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Student').last);
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Register'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();

    expect(find.text('Login to your account'), findsOneWidget);
    await tester.pump(const Duration(seconds: 5));
  });

  testWidgets('forgot password leads to the check-email state',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pump();

    await reachAuthGate(tester);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    expect(find.text('Forgot Password?'), findsOneWidget);

    await tester.enterText(fieldWithHint('name@university.edu'), 'alex@edu.com');
    await tester.ensureVisible(find.text('Send Reset Link'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Send Reset Link'));
    await tester.pump(const Duration(milliseconds: 700));
    await tester.pumpAndSettle();

    expect(find.text('Check your email'), findsOneWidget);
  });
}
