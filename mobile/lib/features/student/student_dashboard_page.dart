import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_card.dart';
import '../auth/auth_controller.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Student dashboard — mirrors the SAGE Stitch home screen: greeting, KPI
/// stats, continue-learning, and announcements. Wired to the API
/// (`api-wiring-plan.md` §A.2): `GET /courses`, `GET /notifications`,
/// `GET /performance/me`.
class StudentDashboardPage extends ConsumerWidget {
  const StudentDashboardPage({super.key});

  String _greeting(DateTime now) {
    final h = now.hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  static const _weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _dateLabel(DateTime d) =>
      '${_weekdays[d.weekday - 1]}, ${d.day} ${_months[d.month - 1]}';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final coursesAsync = ref.watch(apiCoursesProvider);
    final notificationsAsync = ref.watch(apiNotificationsProvider);
    final performanceAsync = ref.watch(apiPerformanceProvider);

    final firstName = user?.fullName.split(' ').first ?? 'there';

    final courses = coursesAsync.value?.items ?? const [];
    final metrics = performanceAsync.value?.metrics;
    final dueTasks = metrics?.byCourse.fold<int>(
          0,
          (sum, c) => sum + (c.assignmentCount - c.submittedCount),
        ) ??
        0;

    final announcements = (notificationsAsync.value?.items ?? const [])
        .where((n) => n.category == 'announcement' || n.category == 'deadline')
        .take(2)
        .toList();

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${_greeting(DateTime.now())}, $firstName!',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: StudentColors.primary,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Here\u2019s what\u2019s happening today.',
                      style: TextStyle(
                        fontSize: 14,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: StudentColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _dateLabel(DateTime.now()),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (coursesAsync.hasError)
            _InlineError(
              onRetry: () => ref.invalidate(apiCoursesProvider),
            ),
          const SizedBox(height: 20),

          // KPI stats
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(
                  value: '${coursesAsync.value?.total ?? courses.length}',
                  label: 'Active Courses',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(
                  value: metrics != null ? '${metrics.avgAssignmentPct}%' : '—',
                  label: 'Avg. Score',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(
                  value: metrics != null ? '$dueTasks' : '—',
                  label: 'Tasks Due',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(
                  value:
                      metrics != null ? '${metrics.missedSubmissionRate}%' : '—',
                  label: 'Missed',
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Continue learning
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StudentSectionHeader(
                  title: 'Continue Learning',
                  trailing: 'My Courses',
                ),
                const SizedBox(height: 8),
                if (coursesAsync.isLoading)
                  for (var i = 0; i < 3; i++) ...[
                    const StudentSkeletonBlock(height: 14),
                    const SizedBox(height: 14),
                  ]
                else if (courses.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'Enroll in a course to get started.',
                      style: TextStyle(
                        fontSize: 13,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  )
                else
                  for (final course in courses.take(3)) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        course.title,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${course.code} · ${course.lecturerName}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: StudentColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${course.enrolledCount} enrolled',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: StudentColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (course != courses.take(3).last)
                      const Divider(height: 1),
                  ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Announcements
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StudentSectionHeader(
                  title: 'Announcements',
                  trailing: 'See All',
                ),
                const SizedBox(height: 8),
                if (notificationsAsync.isLoading)
                  for (var i = 0; i < 2; i++) ...[
                    const StudentSkeletonBlock(height: 44),
                    const SizedBox(height: 16),
                  ]
                else if (announcements.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'Nothing new right now.',
                      style: TextStyle(
                        fontSize: 13,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  )
                else
                  for (final item in announcements) ...[
                    _AnnouncementRow(
                      icon: item.category == 'deadline'
                          ? Icons.schedule
                          : Icons.campaign_outlined,
                      accent: item.category == 'deadline'
                          ? StudentColors.academicGold
                          : StudentColors.primary,
                      title: item.title,
                      time: item.timeLabel,
                      body: item.body ?? '',
                    ),
                    if (item != announcements.last) const Divider(height: 20),
                  ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quick navigation
          Row(
            children: [
              _QuickNav(
                icon: Icons.menu_book_outlined,
                label: 'Courses',
                onTap: () => context.go('/student/courses'),
              ),
              const SizedBox(width: 12),
              _QuickNav(
                icon: Icons.assignment_outlined,
                label: 'Tasks',
                onTap: () => context.go('/student/tasks'),
              ),
              const SizedBox(width: 12),
              _QuickNav(
                icon: Icons.insert_chart_outlined,
                label: 'Analytics',
                onTap: () => context.go('/student/analytics'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.dangerSubtle,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off_outlined, size: 18, color: AppColors.danger),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Could not refresh your courses.',
              style: TextStyle(fontSize: 13, color: AppColors.danger),
            ),
          ),
          TextButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _AnnouncementRow extends StatelessWidget {
  const _AnnouncementRow({
    required this.icon,
    required this.accent,
    required this.title,
    required this.time,
    required this.body,
  });

  final IconData icon;
  final Color accent;
  final String title;
  final String time;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: accent),
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
                      title,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Text(
                    time,
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
                  maxLines: 2,
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
        const SizedBox(width: 4),
        const Padding(
          padding: EdgeInsets.only(top: 6),
          child: Icon(
            Icons.arrow_forward_ios,
            size: 14,
            color: StudentColors.outline,
          ),
        ),
      ],
    );
  }
}

class _QuickNav extends StatelessWidget {
  const _QuickNav({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: SageCard(
        padding: const EdgeInsets.symmetric(vertical: 16),
        onTap: onTap,
        child: Column(
          children: [
            Icon(icon, size: 24, color: StudentColors.primary),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
