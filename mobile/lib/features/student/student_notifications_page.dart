import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Notifications — filter pills + unread rows with category icons and an
/// action per row (Stitch student notifications screen).
class StudentNotificationsPage extends ConsumerStatefulWidget {
  const StudentNotificationsPage({super.key});

  @override
  ConsumerState<StudentNotificationsPage> createState() =>
      _StudentNotificationsPageState();
}

class _StudentNotificationsPageState
    extends ConsumerState<StudentNotificationsPage> {
  String _filter = 'All';

  static const _filters = ['All', 'Grades', 'Deadlines', 'Materials', 'Announcements'];

  @override
  Widget build(BuildContext context) {
    final notifications =
        ref.watch(studentControllerProvider.notifier).notifications;

    final visible = notifications.where((n) {
      return switch (_filter) {
        'Grades' => n.category == 'grade',
        'Deadlines' => n.category == 'deadline',
        'Materials' => n.category == 'material',
        'Announcements' => n.category == 'announcement',
        _ => true,
      };
    }).toList();

    final unreadCount = notifications.where((n) => n.unread).length;

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Notifications',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: StudentColors.primary,
                ),
              ),
              TextButton(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('All notifications marked as read.')),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                child: const Text('Mark all read'),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            unreadCount == 0
                ? 'You\u2019re all caught up'
                : '$unreadCount unread notifications',
            style: const TextStyle(
              fontSize: 14,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final f in _filters)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _NotificationFilter(
                      label: f,
                      selected: _filter == f,
                      onTap: () => setState(() => _filter = f),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          for (final n in visible) ...[
            _NotificationCard(notification: n),
            const SizedBox(height: 10),
          ],
          if (visible.isEmpty)
            const StudentEmptyState(
              icon: Icons.notifications_off_outlined,
              title: 'No notifications here',
              description: 'Nothing matches this filter yet.',
            ),
        ],
      ),
    );
  }
}

class _NotificationFilter extends StatelessWidget {
  const _NotificationFilter({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected
              ? StudentColors.primary
              : StudentColors.surfaceLowest,
          borderRadius: BorderRadius.circular(999),
          border: selected
              ? null
              : Border.all(color: StudentColors.outlineVariant),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : StudentColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.notification});

  final AppNotification notification;

  (IconData, Color) get _meta => switch (notification.category) {
        'grade' => (Icons.emoji_events_outlined, StudentColors.academicGold),
        'deadline' => (Icons.schedule, StudentColors.error),
        'material' => (Icons.folder_open_outlined, StudentColors.primary),
        _ => (Icons.campaign_outlined, StudentColors.success),
      };

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _meta;

    return SageCard(
      highlighted: notification.unread,
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        notification.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: notification.unread
                              ? FontWeight.w700
                              : FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    Text(
                      notification.time,
                      style: const TextStyle(
                        fontSize: 11,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  notification.body,
                  style: const TextStyle(
                    fontSize: 12,
                    color: StudentColors.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
                if (notification.actionLabel != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => context.go('/student/tasks'),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          notification.actionLabel!,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: StudentColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.arrow_forward,
                          size: 13,
                          color: StudentColors.primary,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
