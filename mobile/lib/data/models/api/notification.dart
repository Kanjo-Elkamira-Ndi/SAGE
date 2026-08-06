/// API-driven notification model. Mirrors the notification row returned by
/// `GET /notifications` (see `api-wiring-plan.md` Appendix B).
class ApiNotification {
  const ApiNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.isRead,
    required this.createdAt,
    this.body,
    this.relatedEntityType,
    this.relatedEntityId,
  });

  final String id;

  /// `deadline_reminder`, `material_digest`, `assignment_created`, `grade`,
  /// `announcement`, `quiz_reminder`, `feedback`, ...
  final String type;
  final String title;
  final String? body;
  final String? relatedEntityType;
  final String? relatedEntityId;
  final bool isRead;
  final DateTime createdAt;

  /// Display bucket for the existing filter pills (`api-wiring-plan.md` §A.2).
  String get category {
    if (type.contains('grade') || type == 'feedback') return 'grade';
    if (type.contains('deadline')) return 'deadline';
    if (type.contains('material')) return 'material';
    if (type.contains('announcement')) return 'announcement';
    if (type.contains('quiz')) return 'deadline';
    return 'announcement';
  }

  String get timeLabel {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }

  factory ApiNotification.fromJson(Map<String, dynamic> json) {
    return ApiNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      body: json['body'] as String?,
      relatedEntityType: json['relatedEntityType'] as String?,
      relatedEntityId: json['relatedEntityId'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
    );
  }
}
