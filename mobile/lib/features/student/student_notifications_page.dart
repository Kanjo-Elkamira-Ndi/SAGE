import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/api/notification.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Notifications — filter pills + unread rows with category icons and an
/// action per row. Wired to the API (`api-wiring-plan.md` §A.2):
/// `GET /notifications`, `PATCH /notifications/:id/read`,
/// `PATCH /notifications/read-all`.
class StudentNotificationsPage extends ConsumerStatefulWidget {
  const StudentNotificationsPage({super.key});

  @override
  ConsumerState<StudentNotificationsPage> createState() =>
      _StudentNotificationsPageState();
}

class _StudentNotificationsPageState
    extends ConsumerState<StudentNotificationsPage> {
  String _filter = 'All';

  static const _filters = [
    'All', 'Grades', 'Deadlines', 'Materials', 'Announcements',
  ];

  Future<void> _markRead(ApiNotification notification) async {
    if (notification.isRead) return;
    final repo = ref.read(apiNotificationRepositoryProvider);
    await repo.markRead(notification.id);
    ref.invalidate(apiNotificationsProvider);
  }

  Future<void> _markAllRead() async {
    final repo = ref.read(apiNotificationRepositoryProvider);
    await repo.markAllRead();
    ref.invalidate(apiNotificationsProvider);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All notifications marked as read.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(apiNotificationsProvider);

    return StudentPageScaffold(
      child: notificationsAsync.when(
        loading: () => const _NotificationsLoading(),
        error: (error, _) => _NotificationsError(
          onRetry: () => ref.invalidate(apiNotificationsProvider),
        ),
        data: (page) {
          final notifications = page.items;
          final visible = notifications.where((n) {
            return switch (_filter) {
              'Grades' => n.category == 'grade',
              'Deadlines' => n.category == 'deadline',
              'Materials' => n.category == 'material',
              'Announcements' => n.category == 'announcement',
              _ => true,
            };
          }).toList();

          final unreadCount = page.unread ?? 0;

          return ListView(
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
                  if (unreadCount > 0)
                    TextButton(
                      onPressed: _markAllRead,
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
                _NotificationCard(
                  notification: n,
                  onTap: () => _markRead(n),
                ),
                const SizedBox(height: 10),
              ],
              if (visible.isEmpty)
                const StudentEmptyState(
                  icon: Icons.notifications_off_outlined,
                  title: 'No notifications here',
                  description: 'Nothing matches this filter yet.',
                ),
            ],
          );
        },
      ),
    );
  }
}

class _NotificationsLoading extends StatelessWidget {
  const _NotificationsLoading();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      children: [
        const StudentSkeletonBlock(width: 160, height: 26),
        const SizedBox(height: 8),
        const StudentSkeletonBlock(width: 180, height: 14),
        const SizedBox(height: 16),
        for (var i = 0; i < 4; i++) ...[
          const StudentSkeletonBlock(height: 84, radius: 12),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _NotificationsError extends StatelessWidget {
  const _NotificationsError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return StudentEmptyState(
      icon: Icons.wifi_off_outlined,
      title: 'Something went wrong',
      description: 'Could not load your notifications.',
      actionLabel: 'Retry',
      onAction: onRetry,
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
  const _NotificationCard({required this.notification, required this.onTap});

  final ApiNotification notification;
  final VoidCallback onTap;

  (IconData, Color) get _meta => switch (notification.category) {
        'grade' => (Icons.emoji_events_outlined, StudentColors.academicGold),
        'deadline' => (Icons.schedule, StudentColors.error),
        'material' => (Icons.folder_open_outlined, StudentColors.primary),
        _ => (Icons.campaign_outlined, StudentColors.success),
      };

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _meta;
    final body = notification.body ?? '';

    return SageCard(
      highlighted: !notification.isRead,
      padding: const EdgeInsets.all(14),
      onTap: onTap,
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
                          fontWeight: notification.isRead
                              ? FontWeight.w600
                              : FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    Text(
                      notification.timeLabel,
                      style: const TextStyle(
                        fontSize: 11,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                if (body.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    body,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: StudentColors.onSurfaceVariant,
                      height: 1.4,
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
