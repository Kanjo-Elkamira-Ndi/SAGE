import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/api/performance.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Analytics / performance — course filter chips, headline stats, at-risk
/// breakdown, attendance trend chart, and per-course performance (Stitch
/// student analytics screen). Wired to the API (`api-wiring-plan.md` §A.2):
/// `GET /performance/me`, `GET /performance/me/risk`, `GET /courses`.
class StudentAnalyticsPage extends ConsumerStatefulWidget {
  const StudentAnalyticsPage({super.key});

  @override
  ConsumerState<StudentAnalyticsPage> createState() =>
      _StudentAnalyticsPageState();
}

class _StudentAnalyticsPageState extends ConsumerState<StudentAnalyticsPage> {
  String _course = 'All';

  static const _trend = [0.55, 0.68, 0.62, 0.78, 0.74, 0.88, 0.95];

  String _gradeFor(double? pct) {
    if (pct == null) return '—';
    return switch (pct) {
      >= 90 => 'A',
      >= 80 => 'B',
      >= 70 => 'C',
      >= 60 => 'D',
      _ => 'F',
    };
  }

  @override
  Widget build(BuildContext context) {
    final coursesAsync = ref.watch(apiCoursesProvider);
    final performanceAsync = ref.watch(apiPerformanceProvider);
    final riskAsync = ref.watch(apiRiskProvider);

    final courses = coursesAsync.value?.items ?? const [];
    final metrics = performanceAsync.value?.metrics;
    final risk = riskAsync.value;
    final chips = ['All', ...courses.map((c) => c.code)];

    final courseMetrics = _course == 'All'
        ? (metrics?.byCourse ?? const <ApiCourseMetric>[])
        : (metrics?.byCourse ?? const <ApiCourseMetric>[])
            .where((c) => c.code == _course)
            .toList();
    final attempts =
        courseMetrics.fold<int>(0, (sum, c) => sum + c.assignmentCount);
    final completed =
        courseMetrics.fold<int>(0, (sum, c) => sum + c.submittedCount);
    final topScore = courseMetrics.fold<double?>(
      null,
      (best, c) {
        final pct = c.coursePct;
        return pct == null ? best : (best == null || pct > best ? pct : best);
      },
    );

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

          if (performanceAsync.hasError)
            StudentEmptyState(
              icon: Icons.cloud_off_outlined,
              title: 'Could not load performance',
              description: 'Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () {
                ref.invalidate(apiPerformanceProvider);
                ref.invalidate(apiRiskProvider);
              },
            )
          else if (performanceAsync.isLoading)
            for (var i = 0; i < 4; i++) ...[
              const StudentSkeletonBlock(height: 60),
              const SizedBox(height: 12),
            ]
          else ...[
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
                  child: StudentMiniStat(
                    value: metrics?.avgAssignmentPct != null
                        ? '${metrics!.avgAssignmentPct}%'
                        : '—',
                    label: 'Overall Average',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StudentMiniStat(
                    value: topScore != null ? '${topScore.round()}%' : '—',
                    label: 'Top Score',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: StudentMiniStat(
                    value: '$attempts',
                    label: 'Attempts',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StudentMiniStat(
                    value: '$completed',
                    label: 'Completed',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // At-risk breakdown
            if (risk != null && risk.reasons.isNotEmpty)
              SageCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const StudentSectionHeader(title: 'At-Risk Signals'),
                        const Spacer(),
                        _RiskLevelPill(level: risk.level, score: risk.score),
                      ],
                    ),
                    const SizedBox(height: 10),
                    for (final reason in risk.reasons.take(3))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.warning_amber_rounded,
                              size: 16,
                              color: StudentColors.academicGold,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                reason,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: StudentColors.onSurfaceVariant,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            const SizedBox(height: 20),
          ],

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
          if (courseMetrics.isEmpty)
            const StudentEmptyState(
              icon: Icons.insert_chart_outlined,
              title: 'No course data yet',
              description: 'Performance appears once you have graded work.',
            )
          else
            for (final course in courseMetrics) ...[
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
                          _gradeFor(course.coursePct),
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
                      course.title,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SageProgressBar(
                      value: (course.coursePct ?? 0) / 100,
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

class _RiskLevelPill extends StatelessWidget {
  const _RiskLevelPill({required this.level, required this.score});

  final String level;
  final double score;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (level) {
      'high' => ('High Risk', StudentColors.error),
      'medium' => ('Medium Risk', StudentColors.academicGold),
      _ => ('Low Risk', StudentColors.success),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$label · ${(score * 100).round()}',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
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
