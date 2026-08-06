import '../../../core/api_client.dart';
import '../../../core/pagination.dart';
import '../../models/api/notification.dart';

/// Notification endpoints from the shared contract (`api-wiring-plan.md`
/// §A.2): list, mark-one-read, mark-all-read.
class ApiNotificationRepository {
  ApiNotificationRepository({required this.client});

  final ApiClient client;

  Future<Page<ApiNotification>> list({
    int page = 1,
    int? limit,
    bool? isRead,
    String? type,
  }) async {
    final query = paginationParams(page: page, limit: limit);
    if (isRead != null) query['isRead'] = isRead;
    if (type != null) query['type'] = type;
    final data = await client.get('/notifications', query: query);
    final json = data as Map<String, dynamic>;
    return Page.fromJson(json, ApiNotification.fromJson);
  }

  Future<void> markRead(String id) async {
    await client.patch('/notifications/$id/read');
  }

  Future<int> markAllRead() async {
    final data = await client.patch('/notifications/read-all');
    return (data as Map<String, dynamic>)['updated'] as int? ?? 0;
  }
}
