import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/app_providers.dart';
import '../../core/sage_exception.dart';
import '../../data/models/api/announcement.dart';
import '../../data/models/api/course.dart';
import '../../data/models/api/material.dart';
import '../../shared/widgets/sage_card.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Course management panel — "CS402: Software Architecture" reference screen.
/// Tabs: Materials, Attendance, Announcements. Attendance is demo-only until
/// the attendance module ships.
class LecturerCourseManagementPage extends ConsumerStatefulWidget {
  const LecturerCourseManagementPage({super.key, this.courseId});

  final String? courseId;

  @override
  ConsumerState<LecturerCourseManagementPage> createState() =>
      _LecturerCourseManagementPageState();
}

class _LecturerCourseManagementPageState
    extends ConsumerState<LecturerCourseManagementPage> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final coursesAsync = ref.watch(lecturerApiCoursesProvider);
    final resolvedCourseId =
        widget.courseId ?? (coursesAsync.value?.items.isNotEmpty == true ? coursesAsync.value!.items.first.id : null);
    final courseId = resolvedCourseId;

    if (courseId == null) {
      return LecturerPageScaffold(
        child: coursesAsync.isLoading
            ? const Center(child: CircularProgressIndicator())
            : const LecturerEmptyState(
                icon: Icons.menu_book_outlined,
                title: 'No courses yet',
                description:
                    'You are not teaching any courses in the current semester.',
              ),
      );
    }

    final courseAsync = ref.watch(lecturerApiCourseByIdProvider(courseId));

    return LecturerPageScaffold(
      title: '${courseAsync.value?.code ?? ''} Course Management',
      child: Column(
        children: [
          if (courseAsync.isLoading)
            const Expanded(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (courseAsync.hasError)
            Expanded(
              child: Center(
                child: TextButton(
                  onPressed: () {
                    ref.invalidate(lecturerApiCourseByIdProvider(courseId));
                  },
                  child: const Text('Retry'),
                ),
              ),
            )
          else ...[
            _CourseBanner(course: courseAsync.value!),
            // Tabs
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
              child: Row(
                children: [
                  _TabButton(
                    label: 'Materials',
                    selected: _tab == 0,
                    onTap: () => setState(() => _tab = 0),
                  ),
                  _TabButton(
                    label: 'Attendance',
                    selected: _tab == 1,
                    onTap: () => setState(() => _tab = 1),
                  ),
                  _TabButton(
                    label: 'Announcements',
                    selected: _tab == 2,
                    onTap: () => setState(() => _tab = 2),
                  ),
                ],
              ),
            ),
            Expanded(
              child: switch (_tab) {
                0 => _MaterialsTab(courseId: courseId),
                1 => const _AttendanceTab(),
                _ => _AnnouncementsTab(courseId: courseId),
              },
            ),
          ],
        ],
      ),
    );
  }
}

class _CourseBanner extends StatelessWidget {
  const _CourseBanner({required this.course});

  final ApiCourse course;

  @override
  Widget build(BuildContext context) {
    final subtitle = [
      if (course.departmentName?.isNotEmpty == true) course.departmentName!,
      if (course.semester?.isNotEmpty == true) course.semester!,
      course.lecturerName,
    ].join(' \u2022 ');

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 12, 20, 4),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: LecturerColors.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  course.code,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                    color: LecturerColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  course.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: LecturerColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: LecturerColors.onPrimary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.groups_outlined,
                    size: 16,
                    color: LecturerColors.onPrimary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${course.enrolledCount}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: LecturerColors.onPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'Enrolled',
                style: TextStyle(
                  fontSize: 13,
                  color: LecturerColors.onPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected
                      ? LecturerColors.primary
                      : LecturerColors.onSurfaceVariant,
                ),
              ),
            ),
            Container(
              height: 3,
              decoration: BoxDecoration(
                color: selected
                    ? LecturerColors.primary
                    : LecturerColors.outlineVariant,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(999),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MaterialsTab extends ConsumerStatefulWidget {
  const _MaterialsTab({required this.courseId});

  final String courseId;

  @override
  ConsumerState<_MaterialsTab> createState() => _MaterialsTabState();
}

class _MaterialsTabState extends ConsumerState<_MaterialsTab> {
  bool _uploading = false;

  Future<void> _upload() async {
    final name = await _promptFileName();
    if (name == null || name.trim().isEmpty) return;

    setState(() => _uploading = true);
    try {
      final repo = ref.read(apiMaterialRepositoryProvider);
      final upload = await repo.uploadUrl(
        courseId: widget.courseId,
        fileName: name.trim(),
        contentType: 'application/pdf',
        fileSizeBytes: 1024 * 1024,
      );
      final bytes = utf8.encode('SAGE course material \u2014 $name');
      await ref
          .read(apiClientProvider)
          .uploadToSignedUrl(
            upload.uploadUrl,
            bytes: bytes,
            contentType: 'application/pdf',
          );
      await repo.finalize(
        courseId: widget.courseId,
        storageKey: upload.storageKey,
        title: name.trim(),
        contentType: 'application/pdf',
        fileSizeBytes: bytes.length,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$name uploaded.')),
        );
      }
      ref.invalidate(lecturerMaterialsForCourseProvider(widget.courseId));
    } on SageException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<String?> _promptFileName() {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upload material'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'File name',
            hintText: 'e.g. Module 3 Lecture Notes',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(controller.text),
            child: const Text('Upload'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final materialsAsync =
        ref.watch(lecturerMaterialsForCourseProvider(widget.courseId));

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        LecturerSectionHeader(
          title: 'Course Resources',
          trailing: _uploading ? 'Uploading\u2026' : 'Upload',
          onTrailingTap: _uploading ? null : _upload,
        ),
        const SizedBox(height: 10),
        if (materialsAsync.isLoading)
          const Column(
            children: [
              LecturerSkeletonBlock(height: 56, radius: 12),
              SizedBox(height: 10),
              LecturerSkeletonBlock(height: 56, radius: 12),
            ],
          )
        else if (materialsAsync.hasError)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text(
                'Could not load course materials.',
                style: TextStyle(
                  fontSize: 13,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
            ),
          )
        else if (materialsAsync.value!.isEmpty)
          const LecturerEmptyState(
            icon: Icons.folder_open,
            title: 'No materials yet',
            description: 'Upload the first file for this course.',
          )
        else
          SageCard(
            padding: const EdgeInsets.all(4),
            child: Column(
              children: [
                for (final (i, material) in materialsAsync.value!.indexed) ...[
                  if (i > 0)
                    const Divider(
                      height: 1,
                      color: LecturerColors.outlineVariant,
                      indent: 56,
                    ),
                  _ResourceRow(material: material),
                ],
              ],
            ),
          ),
      ],
    );
  }
}

class _ResourceRow extends StatelessWidget {
  const _ResourceRow({required this.material});

  final ApiMaterial material;

  IconData get _icon => switch (material.type) {
    'pptx' => Icons.slideshow_outlined,
    'notes' => Icons.description_outlined,
    _ => Icons.picture_as_pdf_outlined,
  };

  Color get _iconColor => switch (material.type) {
    'pptx' => LecturerColors.onSecondaryContainer,
    'notes' => LecturerColors.academicGold,
    _ => LecturerColors.error,
  };

  String get _typeLabel => switch (material.type) {
    'pptx' => 'Slides',
    'notes' => 'Notes',
    _ => 'PDF',
  };

  @override
  Widget build(BuildContext context) {
    final meta = [
      _typeLabel,
      if (material.sizeLabel.isNotEmpty) material.sizeLabel,
      'v${material.version}',
    ].join(' \u2022 ');

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: _iconColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(_icon, size: 18, color: _iconColor),
      ),
      title: Text(
        material.title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: LecturerColors.primary,
        ),
      ),
      subtitle: Text(
        meta,
        style: const TextStyle(
          fontSize: 12,
          color: LecturerColors.onSurfaceVariant,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        size: 20,
        color: LecturerColors.outline,
      ),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Opening ${material.title}\u2026')),
        );
      },
    );
  }
}

/// Attendance tab — static demo until the attendance module lands.
class _AttendanceTab extends StatelessWidget {
  const _AttendanceTab();

  static const _sessions = [
    (date: 'Oct 24', attended: 94),
    (date: 'Oct 17', attended: 89),
    (date: 'Oct 10', attended: 92),
    (date: 'Oct 3', attended: 87),
    (date: 'Sep 26', attended: 91),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        SageCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Average Attendance',
                style: TextStyle(
                  fontSize: 13,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 6),
              const Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '91%',
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w700,
                      color: LecturerColors.primary,
                    ),
                  ),
                  SizedBox(width: 10),
                  Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: LecturerDeltaChip(label: '+4.2%'),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Text(
                'Last 5 sessions',
                style: TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (final (i, s) in _sessions.indexed)
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            '${s.attended}%',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: LecturerColors.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            height: (i.isEven ? 72 : 56).toDouble(),
                            decoration: BoxDecoration(
                              color: LecturerColors.primary,
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(8),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            s.date,
                            style: const TextStyle(
                              fontSize: 10,
                              color: LecturerColors.outline,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const LecturerSectionHeader(title: 'Recent Activity'),
        const SizedBox(height: 10),
        SageCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Column(
            children: [
              for (final s in _sessions)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: LecturerColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.calendar_today_outlined,
                      size: 16,
                      color: LecturerColors.primary,
                    ),
                  ),
                  title: Text(
                    s.date,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: LecturerColors.primary,
                    ),
                  ),
                  trailing: Text(
                    '${s.attended}% Attended',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: LecturerColors.primary,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AnnouncementsTab extends ConsumerStatefulWidget {
  const _AnnouncementsTab({required this.courseId});

  final String courseId;

  @override
  ConsumerState<_AnnouncementsTab> createState() => _AnnouncementsTabState();
}

class _AnnouncementsTabState extends ConsumerState<_AnnouncementsTab> {
  bool _posting = false;

  Future<void> _post() async {
    final result = await showDialog<({String title, String body})>(
      context: context,
      builder: (context) => const _AnnouncementComposer(),
    );
    if (result == null) return;

    setState(() => _posting = true);
    try {
      await ref.read(apiAnnouncementRepositoryProvider).create(
        title: result.title,
        body: result.body,
        courseId: widget.courseId,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Announcement posted.')),
        );
      }
      ref.invalidate(lecturerAnnouncementsForCourseProvider(widget.courseId));
    } on SageException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } finally {
      if (mounted) setState(() => _posting = false);
    }
  }

  Future<void> _delete(ApiAnnouncement announcement) async {
    try {
      await ref.read(apiAnnouncementRepositoryProvider).delete(announcement.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Announcement deleted.')),
        );
      }
      ref.invalidate(lecturerAnnouncementsForCourseProvider(widget.courseId));
    } on SageException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final announcementsAsync =
        ref.watch(lecturerAnnouncementsForCourseProvider(widget.courseId));

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        FilledButton.icon(
          onPressed: _posting ? null : _post,
          icon: const Icon(Icons.add_comment, size: 18),
          label: Text(_posting ? 'Posting\u2026' : 'Post New Announcement'),
          style: FilledButton.styleFrom(
            backgroundColor: LecturerColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (announcementsAsync.isLoading)
          const Column(
            children: [
              LecturerSkeletonBlock(height: 120, radius: 14),
              SizedBox(height: 12),
              LecturerSkeletonBlock(height: 120, radius: 14),
            ],
          )
        else if (announcementsAsync.hasError)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text(
                'Could not load announcements.',
                style: TextStyle(
                  fontSize: 13,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
            ),
          )
        else if (announcementsAsync.value!.isEmpty)
          const LecturerEmptyState(
            icon: Icons.campaign_outlined,
            title: 'No announcements yet',
            description: 'Post the first announcement for this course.',
          )
        else
          for (final a in announcementsAsync.value!) ...[
            _AnnouncementCard(
              announcement: a,
              onDelete: () => _delete(a),
            ),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}

class _AnnouncementComposer extends StatefulWidget {
  const _AnnouncementComposer();

  @override
  State<_AnnouncementComposer> createState() => _AnnouncementComposerState();
}

class _AnnouncementComposerState extends State<_AnnouncementComposer> {
  final _title = TextEditingController();
  final _body = TextEditingController();

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New announcement'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _title,
            autofocus: true,
            decoration: const InputDecoration(labelText: 'Title'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _body,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Message'),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () {
            final title = _title.text.trim();
            final body = _body.text.trim();
            if (title.isEmpty || body.isEmpty) return;
            Navigator.of(context).pop((title: title, body: body));
          },
          child: const Text('Post'),
        ),
      ],
    );
  }
}

class _AnnouncementCard extends StatelessWidget {
  const _AnnouncementCard({required this.announcement, required this.onDelete});

  final ApiAnnouncement announcement;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final author = announcement.postedByName ?? announcement.postedBy;
    final initials = author.trim().isEmpty
        ? '?'
        : author
            .trim()
            .split(RegExp(r'\s+'))
            .map((p) => p.isEmpty ? '' : p[0])
            .take(2)
            .join()
            .toUpperCase();

    return SageCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: LecturerColors.primaryContainer,
                child: Text(
                  initials,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: LecturerColors.onPrimaryContainer,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      author,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: LecturerColors.primary,
                      ),
                    ),
                    Text(
                      announcement.timeLabel,
                      style: const TextStyle(
                        fontSize: 11,
                        color: LecturerColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(
                  Icons.delete_outline,
                  size: 20,
                  color: LecturerColors.error,
                ),
                tooltip: 'Delete announcement',
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            announcement.title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            announcement.body,
            style: const TextStyle(
              fontSize: 13,
              height: 1.4,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
