/// SAGE API configuration.
///
/// The base URL is injected at build/run time via
/// `--dart-define=SAGE_API_URL=https://api.sage.app/v1`. When absent the app
/// targets the local dev server so `flutter run` works out of the box:
///
/// - **Android emulator** → `http://10.0.2.2:4000/v1` (the emulator's alias
///   for the host machine).
/// - **Desktop / web / iOS simulator** → `http://localhost:4000/v1`.
/// - **Physical device** → `localhost`/`10.0.2.2` point at the device itself,
///   so you MUST pass the machine's LAN IP:
///
///   ```sh
///   flutter run --dart-define=SAGE_API_URL=http://192.168.1.50:4000/v1
///   ```
///
///   The API dev server (`api/`) listens on all interfaces, so any device on
///   the same Wi-Fi can reach it. Cleartext HTTP is enabled for dev in
///   `android/app/src/main/AndroidManifest.xml` (`usesCleartextTraffic`);
///   production should use HTTPS and drop that flag.
library;

import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

abstract final class ApiConfig {
  static const String _define = String.fromEnvironment('SAGE_API_URL');

  static String get baseUrl {
    if (_define.isNotEmpty) return _define;
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:4000/v1';
    return 'http://localhost:4000/v1';
  }

  /// Default page size for list endpoints (matches the API default `limit=20`).
  static const int defaultPageSize = 20;
}
