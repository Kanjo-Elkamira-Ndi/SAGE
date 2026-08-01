import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Analytics / performance — course filter chips, headline stats, attendance
/// trend chart, and per-course performance (Stitch student analytics screen).
class StudentAnalyticsPage extends ConsumerStatefulWidget {
  const StudentAnalyticsPage({super.key});

  @override
  ConsumerState<StudentAnalyticsPage> createState() =>
      _StudentAnalyticsPageState();
}

class _StudentAnalyticsPageState extends ConsumerState<StudentAnalyticsPage> {
  String _course = 'All';

  static const _trend = [0.55, 0.68, 0.62, 0.78, 0.74, 0.88, 0.95];

  @override
  Widget build(BuildContext context) {
    final courses = ref.watch(studentControllerProvider.notifier).courses;
    final chips = ['All', ...courses.map((c) => c.code)];

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Analytics',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Your academic performance at a glance.',
            style: TextStyle(
              fontSize: 14,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),

          // Course filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final chip in chips)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _AnalyticsChip(
                      label: chip,
                      selected: _course == chip,
                      onTap: () => setState(() => _course = chip),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Headline stats
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(value: '88%', label: 'Overall Average'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(value: '100%', label: 'Top Score'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: StudentMiniStat(value: '18', label: 'Attempts'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StudentMiniStat(value: '14', label: 'Completed'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Attendance trend
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StudentSectionHeader(title: 'Attendance Trend'),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Icon(Icons.trending_up, size: 16, color: StudentColors.success),
                    SizedBox(width: 6),
                    Text(
                      '+4.2% vs last week',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: StudentColors.success,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 120,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      for (final v in _trend)
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Text(
                                  '${(v * 100).round()}',
                                  style: const TextStyle(
                                    fontSize: 9,
                                    color: StudentColors.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  height: 90 * v,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        StudentColors.primary,
                                        StudentColors.primaryContainer,
                                      ],
                                    ),
                                    borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(6),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Mon', style: _axisLabel),
                    Text('Tue', style: _axisLabel),
                    Text('Wed', style: _axisLabel),
                    Text('Thu', style: _axisLabel),
                    Text('Fri', style: _axisLabel),
                    Text('Sat', style: _axisLabel),
                    Text('Sun', style: _axisLabel),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Per-course performance
          const StudentSectionHeader(title: 'Course Performance'),
          const SizedBox(height: 10),
          for (final course in courses) ...[
            SageCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CourseCodeBadge(code: course.code),
                      const Spacer(),
                      Text(
                        course.grade ?? '—',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: StudentColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    course.name,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  SageProgressBar(
                    value: course.progress,
                    height: 6,
                    label: 'Progress',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
          const SizedBox(height: 10),

          // SAGE Assistant CTA
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [StudentColors.primary, StudentColors.primaryContainer],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: StudentColors.secondaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.support_agent,
                    color: StudentColors.onSecondaryContainer,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Need help understanding your grades?',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Ask SAGE Assistant for study tips.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward, color: Colors.white),
                  onPressed: () => context.go('/student/assistant'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

const _axisLabel = TextStyle(
  fontSize: 10,
  color: StudentColors.onSurfaceVariant,
);

class _AnalyticsChip extends StatelessWidget {
  const _AnalyticsChip({
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
          color: selected ? StudentColors.primary : StudentColors.surfaceLowest,
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
