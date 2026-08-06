import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_client.dart';
import 'api_config.dart';
import 'auth_storage.dart';

/// Persisted session storage (access token + cached user).
final authStorageProvider = Provider<AuthStorage>(
  (ref) => AuthStorage(),
);

/// In-memory signal raised when the API reports the session can no longer be
/// refreshed (`AUTH_TOKEN_REUSED` or invalid refresh token). AuthController
/// listens for it and signs out + refreshes the router. Kept as a counter so
/// consecutive signals are not collapsed by Riverpod's equality.
final sessionExpirySignalProvider = NotifierProvider<SessionExpirySignal, int>(
  SessionExpirySignal.new,
);

class SessionExpirySignal extends Notifier<int> {
  @override
  int build() => 0;

  void signal() => state++;
}

/// The shared HTTP client. `main()` builds the real client (async cookie-jar
/// path) and overrides this provider via `ApiClient.create`; this fallback is
/// only used where no override exists (e.g. tests) and skips cookie
/// persistence.
final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(
    baseUrl: ApiConfig.baseUrl,
    storage: ref.watch(authStorageProvider),
    onSessionExpired: () {
      ref.read(sessionExpirySignalProvider.notifier).signal();
    },
  ),
);
