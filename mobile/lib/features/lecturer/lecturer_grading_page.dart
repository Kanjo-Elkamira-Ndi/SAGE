import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/sage_exception.dart';
import '../../data/models/api/assignment.dart';
import '../../data/models/api/course.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Grading queue for a single assignment — submission rows with status chips,
/// plus an expandable grading sheet (score + feedback) for the active row.
class LecturerGradingPage extends ConsumerStatefulWidget {
  const LecturerGradingPage({super.key, this.assignmentId});

  final String? assignmentId;

  @override
  ConsumerState<LecturerGradingPage> createState() =>
      _LecturerGradingPageState();
}

class _LecturerGradingPageState extends ConsumerState<LecturerGradingPage> {
  String? _activeSubmissionId;

  ApiAssignment? _findAssignment(List<ApiAssignment> assignments) {
    if (widget.assignmentId != null) {
      for (final a in assignments) {
        if (a.id == widget.assignmentId) return a;
      }
    }
    if (assignments.isNotEmpty) return assignments.first;
    return null;
  }

  String _codeOf(String? courseId, List<ApiCourse> courses) {
    for (final c in courses) {
      if (c.id == courseId) return c.code;
    }
    return 'Assignments';
  }

  @override
  Widget build(BuildContext context) {
    final assignmentsAsync = ref.watch(lecturerAllAssignmentsProvider);
    final assignment = _findAssignment(assignmentsAsync.value ?? const []);
    final coursesAsync = ref.watch(lecturerApiCoursesProvider);

    if (assignmentsAsync.isLoading) {
      return LecturerPageScaffold(
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    if (assignment == null) {
      return LecturerPageScaffold(
        child: const LecturerEmptyState(
          icon: Icons.assignment_outlined,
          title: 'No assignments yet',
          description: 'Create an assignment to start grading submissions.',
        ),
      );
    }

    final submissionsAsync =
        ref.watch(lecturerSubmissionsForAssignmentProvider(assignment.id));
    final summaryAsync = ref.watch(
      lecturerAssignmentGradingSummaryProvider(assignment.id),
    );
    final summary = summaryAsync.value;
    final graded = summary?.graded ?? 0;
    final total = summary?.total ?? 0;
    final fraction = total == 0 ? 0.0 : (graded / total).clamp(0.0, 1.0);

    return LecturerPageScaffold(
      title: _codeOf(assignment.courseId, coursesAsync.value?.items ?? const []),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Text(
            assignment.title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            assignment.instructions ?? assignment.dueLabel,
            style: const TextStyle(
              fontSize: 13,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 14),
          // Grading progress banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: LecturerColors.surfaceLowest,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: LecturerColors.outlineVariant),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$graded/$total Graded',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: LecturerColors.primary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$total ${
                          total == 1 ? 'submission' : 'submissions'
                        } \u2022 ${total - graded} pending grading',
                        style: const TextStyle(
                          fontSize: 12,
                          color: LecturerColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${(fraction * 100).round()}%',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: LecturerColors.academicGold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Row(
            children: [
              Text(
                'Submissions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (submissionsAsync.isLoading)
            const Column(
              children: [
                LecturerSkeletonBlock(height: 72, radius: 14),
                SizedBox(height: 10),
                LecturerSkeletonBlock(height: 72, radius: 14),
              ],
            )
          else if (submissionsAsync.hasError)
            Center(
              child: TextButton(
                onPressed: () => ref.invalidate(
                  lecturerSubmissionsForAssignmentProvider(assignment.id),
                ),
                child: const Text('Retry'),
              ),
            )
          else if (submissionsAsync.value!.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 24),
              child: Center(
                child: Text(
                  'No submissions yet.',
                  style: TextStyle(
                    fontSize: 13,
                    color: LecturerColors.onSurfaceVariant,
                  ),
                ),
              ),
            )
          else
            for (final submission in submissionsAsync.value!) ...[
              _SubmissionRow(
                submission: submission,
                maxScore: assignment.maxScore,
                expanded: submission.id == _activeSubmissionId,
                onTap: () => setState(() {
                  _activeSubmissionId = submission.id == _activeSubmissionId
                      ? null
                      : submission.id;
                }),
                onGraded: () {
                  ref.invalidate(
                    lecturerSubmissionsForAssignmentProvider(assignment.id),
                  );
                  ref.invalidate(
                    lecturerAssignmentGradingSummaryProvider(assignment.id),
                  );
                  ref.invalidate(lecturerPendingGradingCountProvider);
                },
              ),
              const SizedBox(height: 10),
            ],
        ],
      ),
    );
  }
}

class _SubmissionRow extends StatelessWidget {
  const _SubmissionRow({
    required this.submission,
    required this.maxScore,
    required this.expanded,
    required this.onTap,
    required this.onGraded,
  });

  final ApiSubmission submission;
  final int maxScore;
  final bool expanded;
  final VoidCallback onTap;
  final VoidCallback onGraded;

  bool get _graded => submission.score != null;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: expanded
              ? LecturerColors.primary
              : LecturerColors.outlineVariant,
          width: expanded ? 1.5 : 1,
        ),
      ),
      child: Column(
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: _graded
                        ? LecturerColors.outlineVariant
                        : submission.isLate
                            ? LecturerColors.secondary
                            : LecturerColors.primaryContainer,
                    child: Text(
                      submission.initials,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _graded
                            ? LecturerColors.primary
                            : Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          submission.studentName,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: LecturerColors.primary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          submission.isLate
                              ? '$_submittedLabel \u2022 Late'
                              : _submittedLabel,
                          style: TextStyle(
                            fontSize: 12,
                            color: submission.isLate
                                ? LecturerColors.error
                                : LecturerColors.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_graded)
                    Text(
                      '${submission.score}/$maxScore',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: LecturerColors.academicGold,
                      ),
                    )
                  else
                    _StatusChip(late: submission.isLate),
                ],
              ),
            ),
          ),
          if (expanded) ...[
            const Divider(height: 1, color: LecturerColors.outlineVariant),
            _GradingSheet(
              submission: submission,
              maxScore: maxScore,
              onGraded: onGraded,
            ),
          ],
        ],
      ),
    );
  }

  String get _submittedLabel {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final local = submission.submittedAt.toLocal();
    final two = local.minute.toString().padLeft(2, '0');
    return 'Submitted ${local.day} ${months[local.month - 1]}, '
        '${local.hour}:$two';
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.late});

  final bool late;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: late
            ? LecturerColors.error.withValues(alpha: 0.1)
            : LecturerColors.surfaceHigh,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        late ? 'Late' : 'Submitted',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: late ? LecturerColors.error : LecturerColors.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _GradingSheet extends ConsumerStatefulWidget {
  const _GradingSheet({
    required this.submission,
    required this.maxScore,
    required this.onGraded,
  });

  final ApiSubmission submission;
  final int maxScore;
  final VoidCallback onGraded;

  @override
  ConsumerState<_GradingSheet> createState() => _GradingSheetState();
}

class _GradingSheetState extends ConsumerState<_GradingSheet> {
  final _score = TextEditingController();
  final _feedback = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _score.text = widget.submission.score?.toString() ?? '';
    _feedback.text = widget.submission.feedback ?? '';
  }

  @override
  void dispose() {
    _score.dispose();
    _feedback.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final parsed = int.tryParse(_score.text.trim());
    if (parsed == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid score.')),
      );
      return;
    }
    if (parsed < 0 || parsed > widget.maxScore) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Score must be between 0 and ${widget.maxScore}.')),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      await ref.read(apiAssignmentRepositoryProvider).grade(
        widget.submission.id,
        score: parsed,
        feedback: _feedback.text.trim().isEmpty ? null : _feedback.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Score saved.')),
      );
      widget.onGraded();
    } on SageException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.submission.studentName,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: LecturerColors.primary,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Case Study Analysis',
            style: TextStyle(
              fontSize: 12,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening fullscreen view\u2026')),
              );
            },
            icon: const Icon(Icons.zoom_in, size: 18),
            label: const Text('View Fullscreen'),
            style: OutlinedButton.styleFrom(
              foregroundColor: LecturerColors.primary,
              side: const BorderSide(color: LecturerColors.primary),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Score (out of ${widget.maxScore})',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _score,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: InputDecoration(
              suffixText: '/ ${widget.maxScore}',
              suffixStyle: const TextStyle(
                fontSize: 13,
                color: LecturerColors.onSurfaceVariant,
              ),
              filled: true,
              fillColor: LecturerColors.surfaceLowest,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(
                  color: LecturerColors.outlineVariant,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: LecturerColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'Feedback Comments',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _feedback,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Write constructive feedback for this submission\u2026',
              filled: true,
              fillColor: LecturerColors.surfaceLowest,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(
                  color: LecturerColors.outlineVariant,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: LecturerColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Draft saved.')),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: LecturerColors.primary,
                    side: const BorderSide(color: LecturerColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Save Draft',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: _saving ? null : _save,
                  style: FilledButton.styleFrom(
                    backgroundColor: LecturerColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(
                    _saving ? 'Saving\u2026' : 'Submit & Next',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
