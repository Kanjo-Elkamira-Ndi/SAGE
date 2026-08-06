/// API-driven course material model. Mirrors `MaterialRow` returned by
/// `GET /courses/:id/materials` and `/materials` write endpoints
/// (`api-wiring-plan.md` Appendix A).
class ApiMaterial {
  const ApiMaterial({
    required this.id,
    required this.courseId,
    required this.uploadedBy,
    required this.title,
    required this.type,
    required this.storageKey,
    required this.version,
    required this.isCurrent,
    required this.createdAt,
    this.fileSizeBytes,
    this.replacesMaterialId,
    this.updatedAt,
  });

  final String id;
  final String courseId;
  final String uploadedBy;
  final String title;

  /// `pdf`, `pptx`, or `notes`.
  final String type;
  final String storageKey;
  final int? fileSizeBytes;
  final int version;
  final bool isCurrent;
  final String? replacesMaterialId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  /// Human file-size label, e.g. "1.2 MB".
  String get sizeLabel {
    final bytes = fileSizeBytes;
    if (bytes == null || bytes <= 0) return '';
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(0)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  factory ApiMaterial.fromJson(Map<String, dynamic> json) {
    return ApiMaterial(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      uploadedBy: json['uploadedBy'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      storageKey: json['storageKey'] as String,
      fileSizeBytes: (json['fileSizeBytes'] as num?)?.toInt(),
      version: (json['version'] as num?)?.toInt() ?? 1,
      isCurrent: json['isCurrent'] as bool? ?? true,
      replacesMaterialId: json['replacesMaterialId'] as String?,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
      updatedAt: json['updatedAt'] is String
          ? DateTime.tryParse(json['updatedAt'] as String)?.toLocal()
          : null,
    );
  }
}

/// `POST /materials/upload-url` and `/submissions/upload-url` response.
class ApiUploadUrl {
  const ApiUploadUrl({
    required this.uploadUrl,
    required this.storageKey,
    this.expiresInSeconds = 0,
    this.isLate = false,
  });

  final String uploadUrl;
  final String storageKey;
  final int expiresInSeconds;
  final bool isLate;

  factory ApiUploadUrl.fromJson(Map<String, dynamic> json) {
    return ApiUploadUrl(
      uploadUrl: json['uploadUrl'] as String,
      storageKey: json['storageKey'] as String,
      expiresInSeconds: (json['expiresInSeconds'] as num?)?.toInt() ?? 0,
      isLate: json['isLate'] as bool? ?? false,
    );
  }
}
