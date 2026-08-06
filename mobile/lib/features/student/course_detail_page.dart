import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/api/announcement.dart';
import '../../data/models/api/exam.dart';
import '../../data/models/api/material.dart';
import '../../data/models/api/performance.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_circular_progress.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_widgets.dart';

/// Course detail — progress overview, materials, assignments, quizzes, exams,
/// and the course feed (Stitch student course detail screen). Wired to the
/// API (`api-wiring-plan.md` §A.2): `GET /courses`, `GET /courses/:id/
/// {materials,assignments,quizzes,exams}`, `GET /announcements`.
class CourseDetailPage extends ConsumerWidget {
  const CourseDetailPage({super.key, required this.courseId});

  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(apiCourseByIdProvider(courseId));
    final materialsAsync = ref.watch(apiMaterialsForCourseProvider(courseId));
    final assignmentsAsync =
        ref.watch(apiAssignmentsForCourseProvider(courseId));
    final quizzesAsync = ref.watch(apiQuizzesForCourseProvider(courseId));
    final examsAsync = ref.watch(apiExamsForCourseProvider(courseId));
    final performanceAsync = ref.watch(apiPerformanceProvider);
    final announcementsAsync = ref.watch(apiAnnouncementsProvider);

    final course = courseAsync.value;
    final code = course?.code ?? '—';
    ApiCourseMetric? courseMetric;
    for (final c in performanceAsync.value?.metrics.byCourse ??
        const <ApiCourseMetric>[]) {
      if (c.id == courseId) {
        courseMetric = c;
        break;
      }
    }
    final coursePct = courseMetric?.coursePct;
    final submitted = courseMetric?.submittedCount ?? 0;
    final total = courseMetric?.assignmentCount ?? 0;
    final feed = (announcementsAsync.value?.items ?? const [])
        .where((a) => a.courseId == courseId)
        .toList();

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: Text(
          course?.title ?? 'Course',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
      ),
      body: courseAsync.hasError
          ? StudentEmptyState(
              icon: Icons.cloud_off_outlined,
              title: 'Could not load this course',
              description: 'Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () {
                ref.invalidate(apiCourseByIdProvider(courseId));
                ref.invalidate(apiMaterialsForCourseProvider(courseId));
                ref.invalidate(apiAssignmentsForCourseProvider(courseId));
                ref.invalidate(apiQuizzesForCourseProvider(courseId));
                ref.invalidate(apiExamsForCourseProvider(courseId));
              },
            )
          : courseAsync.isLoading
              ? ListView(
                  padding: const EdgeInsets.all(20),
                  children: const [
                    StudentSkeletonBlock(height: 60),
                    SizedBox(height: 12),
                    StudentSkeletonBlock(height: 120),
                    SizedBox(height: 12),
                    StudentSkeletonBlock(height: 120),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                  children: [
                    Row(
                      children: [
                        CourseCodeBadge(code: code),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            course!.title,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: StudentColors.primary,
                              height: 1.25,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      course.lecturerName,
                      style: const TextStyle(
                        fontSize: 13,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                    if (course.description != null) ...[
                      const SizedBox(height: 10),
                      Text(
                        course.description!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: StudentColors.onSurfaceVariant,
                          height: 1.5,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),

                    // Progress overview
                    SageCard(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          SageCircularProgress(
                            value: coursePct == null
                                ? 0
                                : (coursePct / 100).clamp(0.0, 1.0),
                            size: 84,
                            strokeWidth: 8,
                            color: StudentColors.primary,
                            label: coursePct != null
                                ? '${coursePct.round()}%'
                                : '—',
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _OverviewLine(
                                  label: 'Grade',
                                  value: _gradeFor(coursePct),
                                  color: StudentColors.primary,
                                ),
                                const SizedBox(height: 8),
                                _OverviewLine(
                                  label: 'Assignments',
                                  value: total == 0
                                      ? '—'
                                      : '$submitted/$total',
                                  color: StudentColors.academicGold,
                                ),
                                const SizedBox(height: 8),
                                _OverviewLine(
                                  label: 'Quizzes',
                                  value:
                                      '${quizzesAsync.value?.length ?? 0}',
                                  color: StudentColors.success,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Materials
                    const StudentSectionHeader(title: 'Materials'),
                    const SizedBox(height: 8),
                    if (materialsAsync.hasError ||
                        (materialsAsync.isLoading && materialsAsync.value == null))
                      const StudentSkeletonBlock(height: 72)
                    else if (materialsAsync.value!.isEmpty)
                      const StudentEmptyState(
                        icon: Icons.folder_open_outlined,
                        title: 'No materials yet',
                        description: 'Lecture notes and slides will show here.',
                      )
                    else
                      for (final material in materialsAsync.value!) ...[
                        _MaterialTile(
                          material: material,
                          onDownload: () =>
                              _openMaterial(context, ref, material),
                        ),
                        const SizedBox(height: 10),
                      ],
                    const SizedBox(height: 20),

                    // Assignments
                    const StudentSectionHeader(title: 'Assignments'),
                    const SizedBox(height: 8),
                    if (assignmentsAsync.hasError ||
                        (assignmentsAsync.isLoading &&
                            assignmentsAsync.value == null))
                      const StudentSkeletonBlock(height: 72)
                    else if (assignmentsAsync.value!.isEmpty)
                      const StudentEmptyState(
                        icon: Icons.task_alt,
                        title: 'No assignments yet',
                        description: 'New assignments will show up here.',
                      )
                    else
                      for (final assignment
                          in assignmentsAsync.value!) ...[
                        _CourseAssignmentTile(
                          assignment: Assignment.fromApi(
                            assignment,
                            courseCode: code,
                          ),
                        ),
                        const SizedBox(height: 10),
                      ],
                    const SizedBox(height: 20),

                    // Quizzes
                    const StudentSectionHeader(title: 'Quizzes'),
                    const SizedBox(height: 8),
                    if (quizzesAsync.hasError ||
                        (quizzesAsync.isLoading && quizzesAsync.value == null))
                      const StudentSkeletonBlock(height: 72)
                    else if (quizzesAsync.value!.isEmpty)
                      const StudentEmptyState(
                        icon: Icons.quiz_outlined,
                        title: 'No quizzes yet',
                        description: 'Quizzes for this course will show here.',
                      )
                    else
                      for (final quiz in quizzesAsync.value!) ...[
                        _QuizTile(quiz: Quiz.fromApi(quiz, course: code)),
                        const SizedBox(height: 10),
                      ],
                    const SizedBox(height: 20),

                    // Exams
                    const StudentSectionHeader(title: 'Exams'),
                    const SizedBox(height: 8),
                    if (examsAsync.hasError ||
                        (examsAsync.isLoading && examsAsync.value == null))
                      const StudentSkeletonBlock(height: 72)
                    else if (examsAsync.value!.isEmpty)
                      const StudentEmptyState(
                        icon: Icons.event_seat_outlined,
                        title: 'No exams scheduled',
                        description: 'Exam dates will show up here.',
                      )
                    else
                      for (final exam in examsAsync.value!) ...[
                        _ExamTile(exam: exam),
                        const SizedBox(height: 10),
                      ],
                    const SizedBox(height: 20),

                    // Course feed (announcements for this course)
                    const StudentSectionHeader(title: 'Course Feed'),
                    const SizedBox(height: 8),
                    if (feed.isEmpty)
                      const StudentEmptyState(
                        icon: Icons.campaign_outlined,
                        title: 'No announcements yet',
                        description: 'Updates from your lecturer appear here.',
                      )
                    else
                      for (final item in feed) ...[
                        _FeedTile(item: item),
                        const SizedBox(height: 10),
                      ],
                  ],
                ),
    );
  }

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

  Future<void> _openMaterial(
    BuildContext context,
    WidgetRef ref,
    ApiMaterial material,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final repo = ref.read(apiMaterialRepositoryProvider);
      final url = await repo.downloadUrl(material.id);
      await Clipboard.setData(ClipboardData(text: url));
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            'Download link for "${material.title}" copied to clipboard.',
          ),
        ),
      );
    } catch (_) {
      messenger.showSnackBar(
        const SnackBar(content: Text('Could not prepare the download.')),
      );
    }
  }
}

class _OverviewLine extends StatelessWidget {
  const _OverviewLine({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: StudentColors.onSurfaceVariant,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _MaterialTile extends StatelessWidget {
  const _MaterialTile({required this.material, required this.onDownload});

  final ApiMaterial material;
  final VoidCallback onDownload;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = switch (material.type) {
      'pptx' => (Icons.slideshow_outlined, StudentColors.error),
      'notes' => (Icons.description_outlined, StudentColors.academicGold),
      _ => (Icons.picture_as_pdf_outlined, StudentColors.success),
    };
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  material.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'v${material.version}${material.sizeLabel.isEmpty ? '' : ' · ${material.sizeLabel}'}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.download_outlined,
                size: 20, color: StudentColors.primary),
            onPressed: onDownload,
          ),
        ],
      ),
    );
  }
}

class _CourseAssignmentTile extends ConsumerWidget {
  const _CourseAssignmentTile({required this.assignment});

  final Assignment assignment;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final graded = assignment.status == AssignmentStatus.graded;
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: graded
                  ? StudentColors.successSoft
                  : StudentColors.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.assignment_outlined,
              size: 20,
              color: graded ? StudentColors.success : StudentColors.surfaceLowest,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  assignment.title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  assignment.dueLabel ?? assignment.completedLabel ?? '',
                  style: const TextStyle(
                    fontSize: 12,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          SageButton(
            variant: SageButtonVariant.primary,
            size: SageButtonSize.small,
            onPressed: () =>
                context.go('/student/submit/${assignment.id}'),
            child: Text(graded ? 'View' : 'Submit'),
          ),
        ],
      ),
    );
  }
}

class _QuizTile extends StatelessWidget {
  const _QuizTile({required this.quiz});

  final Quiz quiz;

  @override
  Widget build(BuildContext context) {
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: StudentColors.secondaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.quiz_outlined,
              size: 20,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  quiz.title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  quiz.footnote ?? '${quiz.questionCount} questions',
                  style: const TextStyle(
                    fontSize: 12,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          SageButton(
            variant: SageButtonVariant.accent,
            size: SageButtonSize.small,
            onPressed: () => context.go('/student/quiz/${quiz.id}'),
            child: Text(quiz.buttonLabel ?? 'Start'),
          ),
        ],
      ),
    );
  }
}

class _ExamTile extends StatelessWidget {
  const _ExamTile({required this.exam});

  final ApiExam exam;

  @override
  Widget build(BuildContext context) {
    final date = exam.scheduledAt;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final two = date.minute.toString().padLeft(2, '0');
    final when = '${date.day} ${months[date.month - 1]} \u00b7 '
        '${date.hour}:$two';
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: StudentColors.errorContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.event_seat_outlined,
              size: 20,
              color: StudentColors.error,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exam.title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  [
                    when,
                    if (exam.durationMinutes != null)
                      '${exam.durationMinutes} min',
                    if (exam.venue != null && exam.venue!.isNotEmpty)
                      exam.venue!,
                  ].join(' · '),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
    );
  }
}

class _FeedTile extends StatelessWidget {
  const _FeedTile({required this.item});

  final ApiAnnouncement item;

  @override
  Widget build(BuildContext context) {
    final when = item.createdAt;
    final time = '${when.hour}:${when.minute.toString().padLeft(2, '0')}';
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: StudentColors.primaryContainer,
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(
              Icons.campaign_outlined,
              size: 17,
              color: StudentColors.surfaceLowest,
            ),
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
                        item.title,
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
                  item.body,
                  style: const TextStyle(
                    fontSize: 12,
                    color: StudentColors.onSurfaceVariant,
                    height: 1.4,
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
