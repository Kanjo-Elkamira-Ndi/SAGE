import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import 'student_colors.dart';
import 'student_controller.dart';

/// Submit assignment — metadata header, file selector, title/description
/// fields, and a submit action (Stitch student submit screen).
class SubmitAssignmentPage extends ConsumerStatefulWidget {
  const SubmitAssignmentPage({super.key, required this.assignmentId});

  final String assignmentId;

  @override
  ConsumerState<SubmitAssignmentPage> createState() =>
      _SubmitAssignmentPageState();
}

class _SubmitAssignmentPageState extends ConsumerState<SubmitAssignmentPage> {
  String? _file;
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _pickFile() {
    setState(() => _file = 'submission_v1.pdf');
  }

  void _submit() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Submission sent for review.')),
    );
    context.go('/student/tasks');
  }

  @override
  Widget build(BuildContext context) {
    final assignment =
        ref.watch(studentControllerProvider.notifier).assignmentById(widget.assignmentId);

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
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        children: [
          Text(
            '${assignment.courseCode}: ${assignment.title}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            assignment.description,
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
                  value: 'In Progress',
                  color: StudentColors.academicGold,
                ),
                _MetaColumn(
                  label: 'Due',
                  value: assignment.dueLabel ?? '—',
                  color: StudentColors.primary,
                ),
                _MetaColumn(
                  label: 'Points',
                  value: '${assignment.points}',
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
            onTap: _pickFile,
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
                    _file == null
                        ? Icons.upload_file_outlined
                        : Icons.insert_drive_file_outlined,
                    size: 30,
                    color: StudentColors.primary,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _file ?? 'Tap to choose a file',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _file == null
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
            onPressed: _submit,
            child: const Text('Submit Assignment'),
          ),
        ],
      ),
    );
  }
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
