import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_circular_progress.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_widgets.dart';

/// Course detail — syllabus accordion, course feed, assignments, and quiz
/// attempt (Stitch student course detail screen).
class CourseDetailPage extends ConsumerWidget {
  const CourseDetailPage({super.key, required this.courseId});

  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final course =
        ref.watch(studentControllerProvider.notifier).courseById(courseId);

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: Text(
          course.name,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        children: [
          Row(
            children: [
              CourseCodeBadge(code: course.code),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  course.name,
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
            course.instructor,
            style: const TextStyle(
              fontSize: 13,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            course.description ?? '',
            style: const TextStyle(
              fontSize: 13,
              color: StudentColors.onSurfaceVariant,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),

          // Progress overview
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                SageCircularProgress(
                  value: course.progress,
                  size: 84,
                  strokeWidth: 8,
                  color: StudentColors.primary,
                  label: '${(course.progress * 100).round()}%',
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _OverviewLine(
                        label: 'Grade',
                        value: course.grade ?? '—',
                        color: StudentColors.primary,
                      ),
                      const SizedBox(height: 8),
                      _OverviewLine(
                        label: 'Attendance',
                        value: '${(course.attendance * 100).round()}%',
                        color: StudentColors.success,
                      ),
                      const SizedBox(height: 8),
                      _OverviewLine(
                        label: 'Assignments',
                        value: '${(course.assignmentsProgress * 100).round()}%',
                        color: StudentColors.academicGold,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Syllabus
          const StudentSectionHeader(title: 'Syllabus'),
          const SizedBox(height: 8),
          SageCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Column(
              children: [
                for (final module in course.modules) _ModuleTile(module: module),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Assignments
          const StudentSectionHeader(title: 'Assignments'),
          const SizedBox(height: 8),
          for (final assignment in course.assignments) ...[
            _CourseAssignmentTile(assignment: assignment),
            const SizedBox(height: 10),
          ],
          if (course.assignments.isEmpty)
            const StudentEmptyState(
              icon: Icons.task_alt,
              title: 'No assignments yet',
              description: 'New assignments will show up here.',
            ),

          if (course.assignments.isNotEmpty) ...[
            const SizedBox(height: 12),
            // Quiz attempt
            SageCard(
              color: StudentColors.secondaryContainer,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: StudentColors.surfaceLowest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.quiz_outlined,
                      color: StudentColors.primary,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Quiz 1: Algorithm Fundamentals',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: StudentColors.onSecondaryContainer,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          '3 questions \u00b7 4 min',
                          style: TextStyle(
                            fontSize: 12,
                            color: StudentColors.onSecondaryContainer,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SageButton(
                    variant: SageButtonVariant.accent,
                    size: SageButtonSize.small,
                    onPressed: () =>
                        context.go('/student/quiz/q-cs402-1'),
                    child: const Text('START'),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 20),

          // Course feed
          const StudentSectionHeader(title: 'Course Feed'),
          const SizedBox(height: 8),
          for (final item in course.feed) ...[
            SageCard(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: item.accent == 'secondary'
                          ? StudentColors.secondaryContainer
                          : StudentColors.primaryContainer,
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Icon(
                      item.accent == 'secondary'
                          ? Icons.folder_open_outlined
                          : Icons.description_outlined,
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
                              item.time,
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
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
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

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({required this.module});

  final CourseModule module;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(bottom: 8),
      leading: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: module.locked
              ? StudentColors.surfaceHighest
              : StudentColors.primaryContainer,
          borderRadius: BorderRadius.circular(9),
        ),
        child: Icon(
          module.locked ? Icons.lock_outline : Icons.menu_book_outlined,
          size: 17,
          color: StudentColors.surfaceLowest,
        ),
      ),
      title: Text(
        module.title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        module.locked
            ? 'Module ${module.number} \u00b7 ${module.unlockText ?? 'Locked'}'
            : 'Module ${module.number}',
        style: const TextStyle(
          fontSize: 11,
          color: StudentColors.onSurfaceVariant,
        ),
      ),
      children: [
        for (final item in module.items)
          ListTile(
            dense: true,
            leading: Icon(
              item.type == 'play_circle'
                  ? Icons.play_circle_outline
                  : item.type == 'code'
                      ? Icons.code
                      : Icons.description_outlined,
              size: 18,
              color: StudentColors.primary,
            ),
            title: Text(
              item.title,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textPrimary,
              ),
            ),
          ),
      ],
    );
  }
}

class _CourseAssignmentTile extends ConsumerWidget {
  const _CourseAssignmentTile({required this.assignment});

  final Assignment assignment;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: StudentColors.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.assignment_outlined,
              size: 20,
              color: StudentColors.surfaceLowest,
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
            child: Text(assignment.status == AssignmentStatus.graded
                ? 'View'
                : 'Submit'),
          ),
        ],
      ),
    );
  }
}
