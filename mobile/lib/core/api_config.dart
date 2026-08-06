/// SAGE API configuration.
///
/// The base URL is injected at build/run time via
/// `--dart-define=SAGE_API_URL=https://api.sage.app/v1`. When absent, the
/// app targets the local dev server so `flutter run` works out of the box.
library;

abstract final class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'SAGE_API_URL',
    defaultValue: 'http://localhost:4000/v1',
  );

  /// Default page size for list endpoints (matches the API default `limit=20`).
  static const int defaultPageSize = 20;
}
