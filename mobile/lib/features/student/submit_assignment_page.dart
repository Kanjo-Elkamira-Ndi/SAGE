import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_providers.dart';
import '../../core/sage_exception.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_widgets.dart';

/// Submit assignment — metadata header, file selector, title/description
/// fields, and a submit action (Stitch student submit screen). Wired to the
/// API (`api-wiring-plan.md` §A.3): `POST /submissions/upload-url`, a raw
/// `PUT` to the signed URL, then `POST /submissions` to finalize.
class SubmitAssignmentPage extends ConsumerStatefulWidget {
  const SubmitAssignmentPage({super.key, required this.assignmentId});

  final String assignmentId;

  @override
  ConsumerState<SubmitAssignmentPage> createState() =>
      _SubmitAssignmentPageState();
}

class _SubmitAssignmentPageState extends ConsumerState<SubmitAssignmentPage> {
  String? _fileName;
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _pickFile() {
    final title = _titleController.text.trim().isEmpty
        ? 'submission'
        : _titleController.text.trim().replaceAll(RegExp(r'\s+'), '_');
    setState(() => _fileName = '${title.toLowerCase()}.pdf');
  }

  Future<void> _submit() async {
    if (_fileName == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choose a file to attach first.')),
      );
      return;
    }
    setState(() => _submitting = true);
    final messenger = ScaffoldMessenger.of(context);
    try {
      final repo = ref.read(apiAssignmentRepositoryProvider);
      final assignment = await ref.read(
        apiAssignmentByIdProvider(widget.assignmentId).future,
      );
      final bytes = utf8.encode(
        'SAGE mobile submission · ${_titleController.text.trim()}'
        '${_descriptionController.text.trim().isEmpty ? '' : '\n${_descriptionController.text.trim()}'}',
      );

      final upload = await repo.submissionUploadUrl(
        assignmentId: widget.assignmentId,
        fileName: _fileName!,
        contentType: 'application/pdf',
        fileSizeBytes: bytes.length,
      );
      await ref
          .read(apiClientProvider)
          .uploadToSignedUrl(
            upload.uploadUrl,
            bytes: bytes,
            contentType: 'application/pdf',
          );
      await repo.finalizeSubmission(
        assignmentId: widget.assignmentId,
        storageKey: upload.storageKey,
      );
      ref.invalidate(apiAssignmentsForCourseProvider(assignment.courseId));
      ref.invalidate(apiAllAssignmentsProvider);

      messenger.showSnackBar(
        SnackBar(
          content: Text(
            upload.isLate
                ? 'Submitted late — it is marked for late review.'
                : 'Submission sent for review.',
          ),
        ),
      );
      if (mounted) context.go('/student/tasks');
    } on Exception catch (error) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            error is SageException ? error.message : 'Submission failed. Try again.',
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final assignmentAsync =
        ref.watch(apiAssignmentByIdProvider(widget.assignmentId));
    final assignment = assignmentAsync.value;
    final display = assignment == null
        ? null
        : Assignment.fromApi(assignment, courseCode: '—');

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: const Text(
          'Submit Assignment',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
      ),
      body: assignmentAsync.hasError
          ? StudentEmptyState(
              icon: Icons.cloud_off_outlined,
              title: 'Could not load this assignment',
              description: 'Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () =>
                  ref.invalidate(apiAssignmentByIdProvider(widget.assignmentId)),
            )
          : assignment == null
              ? const StudentEmptyState(
                  icon: Icons.hourglass_top,
                  title: 'Loading assignment…',
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                  children: [
                    Text(
                      '${display!.courseCode}: ${assignment.title}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: StudentColors.primary,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      display.description,
                      style: const TextStyle(
                        fontSize: 13,
                        color: StudentColors.onSurfaceVariant,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),

                    SageCard(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          _MetaColumn(
                            label: 'Status',
                            value: _statusLabel(display.status),
                            color: display.status == AssignmentStatus.graded
                                ? StudentColors.success
                                : StudentColors.academicGold,
                          ),
                          _MetaColumn(
                            label: 'Due',
                            value: display.dueLabel ?? 'Submitted',
                            color: StudentColors.primary,
                          ),
                          _MetaColumn(
                            label: 'Points',
                            value: '${display.points}',
                            color: StudentColors.success,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Select file',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: StudentColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: _submitting ? null : _pickFile,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: StudentColors.surfaceLow,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: StudentColors.outlineVariant),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _fileName == null
                                  ? Icons.upload_file_outlined
                                  : Icons.insert_drive_file_outlined,
                              size: 30,
                              color: StudentColors.primary,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _fileName ?? 'Tap to choose a file',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: _fileName == null
                                    ? StudentColors.onSurfaceVariant
                                    : StudentColors.primary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'PDF, DOCX or ZIP \u00b7 max 20 MB',
                              style: TextStyle(
                                fontSize: 11,
                                color: StudentColors.outline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    TextField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Submission title',
                        hintText: 'e.g. UX Evaluation — Heuristic Review',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _descriptionController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'Notes for the reviewer',
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 24),

                    SageButton(
                      variant: SageButtonVariant.accent,
                      fullWidth: true,
                      isLoading: _submitting,
                      onPressed: _submitting ? null : _submit,
                      child: const Text('Submit Assignment'),
                    ),
                  ],
                ),
    );
  }

  String _statusLabel(AssignmentStatus status) => switch (status) {
        AssignmentStatus.graded => 'Graded',
        AssignmentStatus.submitted => 'Submitted',
        AssignmentStatus.overdue => 'Overdue',
        AssignmentStatus.dueSoon => 'Due soon',
        AssignmentStatus.pending => 'In Progress',
      };
}

class _MetaColumn extends StatelessWidget {
  const _MetaColumn({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
