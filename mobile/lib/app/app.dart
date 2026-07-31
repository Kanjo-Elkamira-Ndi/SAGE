import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router.dart';
import 'theme/sage_theme.dart';

/// Root application widget. Theme + router are the only concerns here; all
/// screens come from the router.
class SageApp extends ConsumerWidget {
  const SageApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'SAGE',
      debugShowCheckedModeBanner: false,
      theme: SageTheme.light(),
      routerConfig: router,
    );
  }
}
