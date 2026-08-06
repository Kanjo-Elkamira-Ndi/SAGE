import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Local session persistence.
///
/// - Access token → `flutter_secure_storage` (never plaintext).
/// - Cached user profile → `shared_preferences` (non-secret, enables a fast
///   splash while `/auth/me` revalidates over the network).
///
/// The refresh token is **never** stored by the app: it lives in the httpOnly
/// cookie that the API sets on `/v1/auth` (see `api-wiring-plan.md` §0.2).
class AuthStorage {
  AuthStorage({FlutterSecureStorage? secure, Future<SharedPreferences> Function()? prefs})
      : _secure = secure ?? const FlutterSecureStorage(),
        _prefs = prefs ?? SharedPreferences.getInstance;

  static const _accessTokenKey = 'sage.access_token';
  static const _userKey = 'sage.cached_user';
  static const _sessionKey = 'sage.has_session';

  final FlutterSecureStorage _secure;
  final Future<SharedPreferences> Function() _prefs;

  Future<String?> readAccessToken() => _secure.read(key: _accessTokenKey);

  Future<void> writeAccessToken(String token) async {
    await _secure.write(key: _accessTokenKey, value: token);
  }

  Future<String?> readCachedUserJson() async {
    final prefs = await _prefs();
    return prefs.getString(_userKey);
  }

  Future<void> writeCachedUser(Map<String, dynamic> userJson) async {
    final prefs = await _prefs();
    await prefs.setString(_userKey, jsonEncode(userJson));
  }

  Future<void> writeSessionFlag(bool present) async {
    final prefs = await _prefs();
    if (present) {
      await prefs.setBool(_sessionKey, true);
    } else {
      await prefs.remove(_sessionKey);
    }
  }

  Future<bool> hasSessionFlag() async {
    final prefs = await _prefs();
    return prefs.getBool(_sessionKey) ?? false;
  }

  /// Wipes the whole local session. Called on logout, session-expiry, and
  /// refresh-token-reuse detection.
  Future<void> clear() async {
    await _secure.delete(key: _accessTokenKey);
    final prefs = await _prefs();
    await prefs.remove(_userKey);
    await prefs.remove(_sessionKey);
  }
}
