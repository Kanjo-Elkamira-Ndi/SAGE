import '../../../core/api_client.dart';
import '../../../core/pagination.dart';
import '../../models/api/announcement.dart';

/// Announcement endpoints (`api-wiring-plan.md` A.3 / B.1): paginated list
/// plus create/update/delete.
class ApiAnnouncementRepository {
  ApiAnnouncementRepository({required this.client});

  final ApiClient client;

  /// `GET /announcements` → `data: { items, total }`.
  Future<Page<ApiAnnouncement>> list({int page = 1, int? limit}) async {
    final data = await client.get(
      '/announcements',
      query: paginationParams(page: page, limit: limit),
    );
    return Page.fromJson(data as Map<String, dynamic>, ApiAnnouncement.fromJson);
  }

  /// `POST /announcements` — returns `{ announcement, notified }`.
  Future<({ApiAnnouncement announcement, int notified})> create({
    required String title,
    required String body,
    String? courseId,
  }) async {
    final data = await client.post('/announcements', body: {
      'title': title,
      'body': body,
      'courseId': courseId,
    });
    final json = data as Map<String, dynamic>;
    return (
      announcement: ApiAnnouncement.fromJson(
        json['announcement'] as Map<String, dynamic>,
      ),
      notified: (json['notified'] as num?)?.toInt() ?? 0,
    );
  }

  /// `PATCH /announcements/:id`.
  Future<ApiAnnouncement> update(
    String id, {
    String? title,
    String? body,
  }) async {
    final data = await client.patch('/announcements/$id', body: {
      'title': title,
      'body': body,
    });
    return ApiAnnouncement.fromJson(
      (data as Map<String, dynamic>)['announcement'] as Map<String, dynamic>,
    );
  }

  /// `DELETE /announcements/:id` — 204, no body.
  Future<void> delete(String id) async {
    await client.delete('/announcements/$id');
  }
}
