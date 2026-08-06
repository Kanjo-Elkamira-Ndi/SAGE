import 'dart:convert';

/// A single page of a list endpoint result: `{ items, total, ... }`.
class Page<T> {
  const Page({required this.items, required this.total, this.unread});

  final List<T> items;

  /// Total matching rows across all pages.
  final int total;

  /// Optional unread count (notifications list exposes `data.unread`).
  final int? unread;

  bool get hasMore => items.length < total;

  static Page<T> fromJson<T>(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromItem, {
    int? unread,
  }) {
    return Page<T>(
      items: (json['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(fromItem)
          .toList(),
      total: json['total'] as int? ?? 0,
      unread: unread ?? (json['unread'] as int?),
    );
  }

  static Map<String, dynamic> decodeItem(dynamic raw) {
    if (raw is Map<String, dynamic>) return raw;
    return jsonDecode(jsonEncode(raw)) as Map<String, dynamic>;
  }
}

/// Query params for page-based pagination (`?page=&limit=`).
Map<String, dynamic> paginationParams({required int page, int? limit}) => {
  'page': page,
  'limit': limit ?? 20,
};
