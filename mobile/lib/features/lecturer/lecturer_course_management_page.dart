import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/lecturer.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_card.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Course management panel — "CS402: Software Architecture" reference screen.
/// Tabs: Materials, Attendance, Announcements.
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
    final controller = ref.watch(lecturerControllerProvider.notifier);
    final course = controller.courseById(widget.courseId ?? 'cs402');

    return LecturerPageScaffold(
      title: '${course.code}: ${course.name}',
      child: Column(
        children: [
          // Next lecture + avg attendance stats
          Container(
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
                      const Text(
                        'Next Lecture',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.6,
                          color: LecturerColors.onPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        course.nextLecture ?? 'TBA',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: LecturerColors.onPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        course.lectureHall ?? '',
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
                          '${course.avgAttendance?.round() ?? 0}%',
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
                      'Avg. Attendance',
                      style: TextStyle(
                        fontSize: 13,
                        color: LecturerColors.onPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

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
              0 => _MaterialsTab(course: course),
              1 => _AttendanceTab(course: course),
              _ => _AnnouncementsTab(course: course),
            },
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

class _MaterialsTab extends StatelessWidget {
  const _MaterialsTab({required this.course});

  final LecturerCourse course;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        LecturerSectionHeader(
          title: 'Course Resources',
          trailing: 'Upload',
          onTrailingTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Upload a file to this course.')),
            );
          },
        ),
        const SizedBox(height: 10),
        SageCard(
          padding: const EdgeInsets.all(4),
          child: Column(
            children: [
              for (final (i, resource) in course.resources.indexed) ...[
                if (i > 0)
                  const Divider(
                    height: 1,
                    color: LecturerColors.outlineVariant,
                    indent: 56,
                  ),
                _ResourceRow(resource: resource),
              ],
            ],
          ),
        ),
        const SizedBox(height: 20),
        LecturerSectionHeader(title: 'Today\u2019s Session'),
        const SizedBox(height: 10),
        SageCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Oct 24, 2024 \u2022 14:00 - 16:00',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: LecturerColors.onSurfaceVariant,
                      ),
                    ),
                  ),
                  LecturerTag(
                    label: 'Active Now',
                    variant: SageBadgeVariant.success,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Text(
                'Self-Check In',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Allow students to mark present',
                style: TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('QR code shown.')),
                        );
                      },
                      icon: const Icon(Icons.qr_code_2, size: 18),
                      label: const Text('Show QR'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: LecturerColors.primary,
                        side: const BorderSide(color: LecturerColors.primary),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Manual attendance list.'),
                          ),
                        );
                      },
                      icon: const Icon(Icons.how_to_reg, size: 18),
                      label: const Text('Manual List'),
                      style: FilledButton.styleFrom(
                        backgroundColor: LecturerColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ResourceRow extends StatelessWidget {
  const _ResourceRow({required this.resource});

  final CourseResource resource;

  IconData get _icon => switch (resource.type) {
    'pdf' => Icons.picture_as_pdf_outlined,
    'link' => Icons.link,
    _ => Icons.folder_outlined,
  };

  Color get _iconColor => switch (resource.type) {
    'pdf' => LecturerColors.error,
    'link' => LecturerColors.onSecondaryContainer,
    _ => LecturerColors.academicGold,
  };

  @override
  Widget build(BuildContext context) {
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
        resource.title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: LecturerColors.primary,
        ),
      ),
      subtitle: Text(
        resource.subtitle,
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
          SnackBar(content: Text('Opening ${resource.title}\u2026')),
        );
      },
    );
  }
}

class _AttendanceTab extends StatelessWidget {
  const _AttendanceTab({required this.course});

  final LecturerCourse course;

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
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${course.avgAttendance?.round() ?? 0}%',
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w700,
                      color: LecturerColors.primary,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Padding(
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
                  for (final (i, s) in course.sessions.indexed)
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
        LecturerSectionHeader(title: 'Recent Activity'),
        const SizedBox(height: 10),
        SageCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Column(
            children: [
              for (final s in course.sessions)
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

class _AnnouncementsTab extends StatelessWidget {
  const _AnnouncementsTab({required this.course});

  final LecturerCourse course;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        FilledButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Compose a new announcement.')),
            );
          },
          icon: const Icon(Icons.add_comment, size: 18),
          label: const Text('Post New Announcement'),
          style: FilledButton.styleFrom(
            backgroundColor: LecturerColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (course.announcements.isEmpty)
          const LecturerEmptyState(
            icon: Icons.campaign_outlined,
            title: 'No announcements yet',
            description: 'Post the first announcement for this course.',
          )
        else
          for (final a in course.announcements) ...[
            _AnnouncementCard(announcement: a),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}

class _AnnouncementCard extends StatelessWidget {
  const _AnnouncementCard({required this.announcement});

  final CourseAnnouncement announcement;

  @override
  Widget build(BuildContext context) {
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
                  announcement.initials,
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
                      announcement.author,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: LecturerColors.primary,
                      ),
                    ),
                    Text(
                      announcement.time,
                      style: const TextStyle(
                        fontSize: 11,
                        color: LecturerColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
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
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.visibility_outlined,
                size: 15,
                color: LecturerColors.outline,
              ),
              const SizedBox(width: 4),
              Text(
                '${announcement.views} Views',
                style: const TextStyle(
                  fontSize: 11,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(width: 14),
              const Icon(
                Icons.chat_bubble_outline,
                size: 15,
                color: LecturerColors.outline,
              ),
              const SizedBox(width: 4),
              Text(
                '${announcement.comments} Comments',
                style: const TextStyle(
                  fontSize: 11,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
