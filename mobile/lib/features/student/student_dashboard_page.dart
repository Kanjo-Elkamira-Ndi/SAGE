import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import '../auth/auth_controller.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Student dashboard — mirrors the SAGE Stitch home screen: greeting, KPI
/// stats, schedule preview, continue-learning, and announcements.
class StudentDashboardPage extends ConsumerWidget {
  const StudentDashboardPage({super.key});

  String _greeting(DateTime now) {
    final h = now.hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final controller = ref.watch(studentControllerProvider.notifier);
    final courses = controller.courses;
    final assignments = controller.assignments;

    final firstName = user?.fullName.split(' ').first ?? 'there';
    final now = DateTime.now();
    final schedule = <({String time, String label})>[
      (time: 'Tue 10:00', label: 'CS-402 · Lecture'),
      (time: 'Tue 12:00', label: 'MTH301 · Tutorial'),
    ];

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
                      '${_greeting(now)}, $firstName!',
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
                child: const Text(
                  'Sat, 1 Aug',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // MVP callout
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: StudentColors.secondaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, size: 20, color: StudentColors.onSecondaryContainer),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'In this demo: dashboard stats preview only \u2014 no backend yet.',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: StudentColors.onSecondaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // KPI stats
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(
                  value: '${courses.length}',
                  label: 'Active Courses',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(value: '87%', label: 'Avg. Score'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(
                  value:
                      '${assignments.where((a) => a.status != AssignmentStatus.graded && a.status != AssignmentStatus.submitted).length}',
                  label: 'Tasks Due',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(value: '92%', label: 'Attendance'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Schedule preview
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StudentSectionHeader(
                  title: 'Schedule Preview',
                  trailing: 'Show My Schedule',
                ),
                const SizedBox(height: 4),
                if (schedule.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'No classes today \u2014 enjoy the break!',
                      style: TextStyle(
                        fontSize: 13,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  )
                else
                  for (final item in schedule)
                    Container(
                      margin: const EdgeInsets.only(top: 10),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: StudentColors.surfaceLow,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: StudentColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              item.label,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: StudentColors.primary,
                              ),
                            ),
                          ),
                          Text(
                            item.time,
                            style: const TextStyle(
                              fontSize: 12,
                              color: StudentColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Continue learning
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StudentSectionHeader(title: 'Continue Learning'),
                const SizedBox(height: 8),
                for (final course in courses.take(3)) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                course.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              SageProgressBar(
                                value: course.progress,
                                height: 6,
                                showPercent: false,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '${(course.progress * 100).round()}%',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
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
                const StudentSectionHeader(title: 'Announcements'),
                const SizedBox(height: 8),
                _AnnouncementRow(
                  icon: Icons.campaign_outlined,
                  accent: StudentColors.primary,
                  title: 'Quiz reminder: CS402',
                  time: '1h ago',
                  body: 'Quiz 1: Algorithm Fundamentals closes in 2 hours.',
                ),
                const Divider(height: 20),
                _AnnouncementRow(
                  icon: Icons.assignment_outlined,
                  accent: StudentColors.academicGold,
                  title: 'New assignment in MTH301',
                  time: '25m ago',
                  body: 'Problem Set 2 is now available.',
                ),
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
              const SizedBox(height: 2),
              Text(
                body,
                style: const TextStyle(
                  fontSize: 12,
                  color: StudentColors.onSurfaceVariant,
                  height: 1.4,
                ),
              ),
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
