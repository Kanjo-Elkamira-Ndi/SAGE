import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Tasks — assignments list (with course, due, attachment, submit) followed by
/// the quiz attempts section (Stitch student assignments + quizzes screens).
class StudentTasksPage extends ConsumerStatefulWidget {
  const StudentTasksPage({super.key});

  @override
  ConsumerState<StudentTasksPage> createState() => _StudentTasksPageState();
}

class _StudentTasksPageState extends ConsumerState<StudentTasksPage> {
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(studentControllerProvider.notifier);
    final assignments = controller.assignments;
    final quizzes = controller.quizzes;

    final visible = assignments.where((a) {
      return switch (_filter) {
        'Due Soon' =>
          a.status == AssignmentStatus.overdue ||
              a.status == AssignmentStatus.dueSoon ||
              a.status == AssignmentStatus.pending,
        'Completed' =>
          a.status == AssignmentStatus.submitted ||
              a.status == AssignmentStatus.graded,
        _ => true,
      };
    }).toList();

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Tasks',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${assignments.length} assignments \u00b7 ${quizzes.where((q) => q.status == QuizStatus.active).length} quizzes due soon',
            style: const TextStyle(
              fontSize: 14,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),

          // Filters
          Row(
            children: [
              for (final f in ['All', 'Due Soon', 'Completed'])
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _FilterChip(
                    label: f,
                    selected: _filter == f,
                    onTap: () => setState(() => _filter = f),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          for (final assignment in visible) ...[
            _AssignmentCard(assignment: assignment),
            const SizedBox(height: 12),
          ],
          if (visible.isEmpty)
            const StudentEmptyState(
              icon: Icons.task_alt,
              title: 'Nothing here',
              description: 'No tasks match this filter.',
            ),

          const SizedBox(height: 8),
          const StudentSectionHeader(title: 'Quizzes'),
          const SizedBox(height: 12),
          for (final quiz in quizzes) ...[
            _QuizCard(quiz: quiz),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
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

class _AssignmentCard extends StatelessWidget {
  const _AssignmentCard({required this.assignment});

  final Assignment assignment;

  @override
  Widget build(BuildContext context) {
    final graded = assignment.status == AssignmentStatus.graded;

    return SageCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CourseCodeBadge(code: assignment.courseCode),
              const SizedBox(width: 8),
              AssignmentStatusBadge(status: assignment.status),
              const Spacer(),
              Text(
                assignment.points.toString(),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: StudentColors.primary,
                ),
              ),
              const Text(
                ' pts',
                style: TextStyle(
                  fontSize: 11,
                  color: StudentColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            assignment.title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(
                Icons.event_outlined,
                size: 14,
                color: StudentColors.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              Text(
                assignment.dueLabel ?? assignment.completedLabel ?? '',
                style: const TextStyle(
                  fontSize: 12,
                  color: StudentColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: StudentColors.surfaceLow,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.attach_file,
                  size: 15,
                  color: StudentColors.onSurfaceVariant,
                ),
                const SizedBox(width: 6),
                Text(
                  'assignment_brief.pdf',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: SageButton(
              variant: graded ? SageButtonVariant.outline : SageButtonVariant.accent,
              size: SageButtonSize.small,
              onPressed: () =>
                  context.go('/student/submit/${assignment.id}'),
              child: Text(graded ? 'View Submission' : 'Upload Submission'),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuizCard extends StatelessWidget {
  const _QuizCard({required this.quiz});

  final Quiz quiz;

  @override
  Widget build(BuildContext context) {
    return SageCard(
      padding: const EdgeInsets.all(16),
      onTap: () {
        if (quiz.status == QuizStatus.active || quiz.status == QuizStatus.completed) {
          context.go('/student/quiz/${quiz.id}');
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              QuizStatusBadge(status: quiz.status),
              const SizedBox(width: 8),
              if (quiz.badge != null)
                SageBadge(
                  label: quiz.badge!,
                  variant: quiz.status == QuizStatus.completed
                      ? SageBadgeVariant.success
                      : SageBadgeVariant.neutral,
                  compact: true,
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            quiz.title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            quiz.footnote ?? '${quiz.questionCount} questions \u00b7 ${quiz.durationMins} min',
            style: const TextStyle(
              fontSize: 12,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: SageButton(
              variant: quiz.status == QuizStatus.active
                  ? SageButtonVariant.accent
                  : SageButtonVariant.outline,
              size: SageButtonSize.small,
              onPressed: () => context.go('/student/quiz/${quiz.id}'),
              child: Text(quiz.buttonLabel ?? 'Open'),
            ),
          ),
        ],
      ),
    );
  }
}
