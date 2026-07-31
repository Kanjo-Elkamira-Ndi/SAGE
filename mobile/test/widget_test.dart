import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/app/app.dart';
import 'package:mobile/app/theme/sage_colors.dart';

void main() {
  testWidgets('brand tokens match the documented palette', (tester) async {
    expect(AppColors.primary, const Color(0xFF1E3A8A));
    expect(AppColors.accent, const Color(0xFFD4A017));
    expect(AppColors.textPrimary, const Color(0xFF2D2E33));
    expect(AppColors.surface, const Color(0xFFF8F9FB));
  });

  testWidgets('app boots to branded splash with role preview actions',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pumpAndSettle();

    expect(find.text('SAGE'), findsOneWidget);
    expect(find.text('Continue as Student'), findsOneWidget);
    expect(find.text('Continue as Lecturer'), findsOneWidget);
  });

  testWidgets('signing in as student lands on the student shell',
      (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SageApp()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Continue as Student'));
    await tester.pumpAndSettle();

    expect(find.text('Good morning, Alex!'), findsOneWidget);
    expect(find.text('Academic Portal'), findsOneWidget);
    expect(find.text('Active Courses'), findsOneWidget);
  });
}
