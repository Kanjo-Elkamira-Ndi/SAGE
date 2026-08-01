import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import '../auth/auth_controller.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Lecturer dashboard — mirrors the SAGE Stitch home screen: greeting, KPI
/// stats, "Up Next" session card, recent activity, and curriculum status.
class LecturerDashboardPage extends ConsumerWidget {
  const LecturerDashboardPage({super.key});

  String _greeting(DateTime now) {
    final h = now.hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final controller = ref.watch(lecturerControllerProvider.notifier);
    final courses = controller.courses;
    final assignments = controller.assignments;
    final pendingGradings = assignments.fold<int>(
      0,
      (sum, a) => sum + a.pendingCount,
    );

    final fullName = user?.fullName ?? 'Prof. Rivers';

    return LecturerPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Welcome back,',
            style: TextStyle(
              fontSize: 14,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '${_greeting(DateTime.now())}, $fullName',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                size: 14,
                color: LecturerColors.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              const Text(
                'Monday, Oct 23rd',
                style: TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 20),

          // KPI stats
          Row(
            children: [
              Expanded(
                child: _DashboardStat(
                  icon: Icons.groups_outlined,
                  iconColor: LecturerColors.primary,
                  value: '1,248',
                  label: 'Total Students',
                  delta: '+4%',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DashboardStat(
                  icon: Icons.school_outlined,
                  iconColor: LecturerColors.academicGold,
                  value: courses.length.toString().padLeft(2, '0'),
                  label: 'Active Courses',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _PendingGradingCard(
            value: '$pendingGradings Submissions',
            onViewList: () => context.go('/lecturer/tasks'),
          ),
          const SizedBox(height: 20),

          // Up Next
          const LecturerSectionHeader(title: 'Up Next'),
          const SizedBox(height: 10),
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Advanced Psychodynamics',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: LecturerColors.primary,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Post-graduate Seminar',
                            style: TextStyle(
                              fontSize: 13,
                              color: LecturerColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: LecturerColors.secondaryContainer,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'In 45 mins',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: LecturerColors.onSecondaryContainer,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const _MetaRow(
                  icon: Icons.meeting_room_outlined,
                  text: 'Hall 7B, Floor 2',
                ),
                const SizedBox(height: 8),
                const _MetaRow(
                  icon: Icons.schedule,
                  text: '10:30 AM \u2014 12:00 PM',
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => context.go('/lecturer/courses'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: LecturerColors.primary,
                          side: const BorderSide(color: LecturerColors.primary),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          'Syllabus',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => context.go('/lecturer/courses'),
                        style: FilledButton.styleFrom(
                          backgroundColor: LecturerColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          'Attendance',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Recent activity
          LecturerSectionHeader(
            title: 'Recent Activity',
            trailing: 'Mark all read',
            onTrailingTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All activity marked as read.')),
              );
            },
          ),
          const SizedBox(height: 10),
          _ActivityRow(
            icon: Icons.assignment_outlined,
            title: 'New Submission',
            time: '12m ago',
            body:
                'uploaded \u201CFinal Project Draft\u201D for Cognitive Studies.',
            actor: 'Elena Vance',
          ),
          _ActivityRow(
            icon: Icons.forum_outlined,
            title: 'Forum Post',
            time: '1h ago',
            body: 'New discussion in regarding Chapter 4.',
            actor: 'Applied Ethics',
          ),
          _ActivityRow(
            icon: Icons.chat_bubble_outline,
            title: 'Direct Message',
            time: '3h ago',
            body: 'sent you a message about the departmental review.',
            actor: 'Dr. Aris Thorne',
          ),
          const SizedBox(height: 12),

          // Curriculum status
          const LecturerSectionHeader(title: 'Curriculum Status'),
          const SizedBox(height: 10),
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                for (final (i, course) in courses.indexed) ...[
                  if (i > 0) const SizedBox(height: 14),
                  _CurriculumRow(
                    code: course.code,
                    progress: course.syllabusCompletion,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _DashboardStat extends StatelessWidget {
  const _DashboardStat({
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.label,
    this.delta,
  });

  final IconData icon;
  final Color iconColor;
  final String value;
  final String label;
  final String? delta;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LecturerColors.outlineVariant, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const Spacer(),
              if (delta != null) LecturerDeltaChip(label: delta!),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

class _PendingGradingCard extends StatelessWidget {
  const _PendingGradingCard({required this.value, required this.onViewList});

  final String value;
  final VoidCallback onViewList;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LecturerColors.outlineVariant, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: LecturerColors.academicGold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.fact_check_outlined,
              size: 18,
              color: LecturerColors.academicGold,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: LecturerColors.primary,
                  ),
                ),
                const Text(
                  'Pending Gradings',
                  style: TextStyle(
                    fontSize: 12,
                    color: LecturerColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onViewList,
            child: const Text(
              'View List',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  const _MetaRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: LecturerColors.outline),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({
    required this.icon,
    required this.title,
    required this.time,
    required this.body,
    required this.actor,
  });

  final IconData icon;
  final String title;
  final String time;
  final String body;
  final String actor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: LecturerColors.outlineVariant),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: LecturerColors.surfaceContainer,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 17, color: LecturerColors.primary),
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
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: LecturerColors.outline,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text.rich(
                  TextSpan(
                    text: '$actor ',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                    children: [
                      TextSpan(
                        text: body,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                          color: LecturerColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CurriculumRow extends StatelessWidget {
  const _CurriculumRow({required this.code, required this.progress});

  final String code;
  final double progress;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              code,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
            Text(
              '${(progress * 100).round()}% Complete',
              style: const TextStyle(
                fontSize: 11,
                color: LecturerColors.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        SageProgressBar(value: progress, height: 6, showPercent: false),
      ],
    );
  }
}
