import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/lecturer.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';

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

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(lecturerControllerProvider.notifier);
    final assignment = controller.assignmentById(
      widget.assignmentId ?? 'la-cs402-1',
    );
    final submissions = controller.getSubmissions(assignment.id);

    return LecturerPageScaffold(
      title: assignment.code,
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
            assignment.subtitle,
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
                        '${assignment.gradedCount}/${assignment.totalSubmissions} '
                        'Graded',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: LecturerColors.primary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${assignment.pendingCount} pending grading',
                        style: const TextStyle(
                          fontSize: 12,
                          color: LecturerColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${(assignment.gradedFraction * 100).round()}%',
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
          Row(
            children: [
              const Text(
                'Submissions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Filter submissions.')),
                  );
                },
                icon: const Icon(
                  Icons.filter_list,
                  size: 20,
                  color: LecturerColors.outline,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          if (submissions.isEmpty)
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
            for (final submission in submissions) ...[
              _SubmissionRow(
                submission: submission,
                expanded: submission.id == _activeSubmissionId,
                onTap: () => setState(() {
                  _activeSubmissionId = submission.id == _activeSubmissionId
                      ? null
                      : submission.id;
                }),
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
    required this.expanded,
    required this.onTap,
  });

  final Submission submission;
  final bool expanded;
  final VoidCallback onTap;

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
                    backgroundColor: switch (submission.status) {
                      SubmissionStatus.late => LecturerColors.secondary,
                      SubmissionStatus.graded => LecturerColors.outlineVariant,
                      _ => LecturerColors.primaryContainer,
                    },
                    child: Text(
                      submission.initials,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: submission.status == SubmissionStatus.late
                            ? LecturerColors.onSecondary
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
                          submission.meta,
                          style: TextStyle(
                            fontSize: 12,
                            color: submission.status == SubmissionStatus.late
                                ? LecturerColors.error
                                : LecturerColors.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (submission.status == SubmissionStatus.graded)
                    Text(
                      '${submission.score}/100',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: LecturerColors.academicGold,
                      ),
                    )
                  else
                    _StatusChip(status: submission.status),
                ],
              ),
            ),
          ),
          if (expanded) ...[
            const Divider(height: 1, color: LecturerColors.outlineVariant),
            _GradingSheet(
              submission: submission,
              onDone: () {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(const SnackBar(content: Text('Score saved.')));
              },
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final SubmissionStatus status;

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      SubmissionStatus.submitted => 'Submitted',
      SubmissionStatus.late => 'Late',
      SubmissionStatus.graded => 'Graded',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceHigh,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: LecturerColors.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _GradingSheet extends StatefulWidget {
  const _GradingSheet({required this.submission, required this.onDone});

  final Submission submission;
  final VoidCallback onDone;

  @override
  State<_GradingSheet> createState() => _GradingSheetState();
}

class _GradingSheetState extends State<_GradingSheet> {
  final _score = TextEditingController();
  final _feedback = TextEditingController();

  @override
  void initState() {
    super.initState();
    _score.text = widget.submission.score?.toString() ?? '';
  }

  @override
  void dispose() {
    _score.dispose();
    _feedback.dispose();
    super.dispose();
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
            'Submission #4429 \u2022 Case Study Analysis',
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
          const Text(
            'Score (out of 100)',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: LecturerColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _score,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              suffixText: '/ 100',
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
                  onPressed: widget.onDone,
                  style: FilledButton.styleFrom(
                    backgroundColor: LecturerColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Submit & Next',
                    style: TextStyle(fontWeight: FontWeight.w600),
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
