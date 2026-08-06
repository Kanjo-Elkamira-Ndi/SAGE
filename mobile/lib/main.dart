import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'core/api_client.dart';
import 'core/api_config.dart';
import 'core/app_providers.dart';
import 'core/auth_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = AuthStorage();

  // Build the HTTP client once, before the widget tree mounts: the cookie
  // jar needs an async path lookup so the httpOnly refresh cookie survives
  // app restarts (`api-wiring-plan.md` §0.2). The container is app-lifetime
  // owned and hands the session-expiry signal to the shared notifier.
  late final ProviderContainer container;
  final client = await ApiClient.create(
    baseUrl: ApiConfig.baseUrl,
    storage: storage,
    onSessionExpired: () {
      container.read(sessionExpirySignalProvider.notifier).signal();
    },
  );
  container = ProviderContainer(
    overrides: [
      apiClientProvider.overrideWithValue(client),
      authStorageProvider.overrideWithValue(storage),
    ],
  );

  runApp(
    UncontrolledProviderScope(container: container, child: const SageApp()),
  );
}
