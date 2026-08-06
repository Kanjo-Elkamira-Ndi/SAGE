/// API-driven announcement model. Mirrors `AnnouncementRow` returned by
/// `GET /announcements` (`api-wiring-plan.md` Appendix A).
class ApiAnnouncement {
  const ApiAnnouncement({
    required this.id,
    required this.title,
    required this.body,
    required this.postedBy,
    required this.createdAt,
    this.courseId,
    this.courseTitle,
    this.postedByName,
    this.updatedAt,
  });

  final String id;
  final String? courseId;
  final String? courseTitle;
  final String title;
  final String body;
  final String postedBy;
  final String? postedByName;
  final DateTime createdAt;
  final DateTime? updatedAt;

  /// Relative time label, e.g. "2h ago".
  String get timeLabel {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }

  factory ApiAnnouncement.fromJson(Map<String, dynamic> json) {
    return ApiAnnouncement(
      id: json['id'] as String,
      courseId: json['courseId'] as String?,
      courseTitle: json['courseTitle'] as String?,
      title: json['title'] as String,
      body: json['body'] as String? ?? '',
      postedBy: json['postedBy'] as String,
      postedByName: json['postedByName'] as String?,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      updatedAt: json['updatedAt'] is String
          ? DateTime.tryParse(json['updatedAt'] as String)?.toLocal()
          : null,
    );
  }
}
