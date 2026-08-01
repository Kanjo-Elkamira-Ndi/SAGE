import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'lecturer_colors.dart';
import 'lecturer_scaffold.dart';

/// Create-assignment wizard — three steps (Info, Grading, Files) matching the
/// Stitch reference. Draft publish is a mock action for now.
class LecturerCreateAssignmentPage extends StatefulWidget {
  const LecturerCreateAssignmentPage({super.key});

  @override
  State<LecturerCreateAssignmentPage> createState() =>
      _LecturerCreateAssignmentPageState();
}

class _LecturerCreateAssignmentPageState
    extends State<LecturerCreateAssignmentPage> {
  int _step = 0;

  final _title = TextEditingController();
  final _description = TextEditingController();
  String _course = 'CS-402 \u00b7 Advanced Algorithms';
  final _dueDate = TextEditingController();
  final _dueTime = TextEditingController();
  final _points = TextEditingController();
  final _weight = TextEditingController();

  static const _courses = [
    'CS-402 \u00b7 Advanced Algorithms',
    'CS-302 \u00b7 Algorithm Design',
    'DS-101 \u00b7 Data Science',
    'AI-405 \u00b7 Neural Architectures',
  ];

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _dueDate.dispose();
    _dueTime.dispose();
    _points.dispose();
    _weight.dispose();
    super.dispose();
  }

  void _next() {
    if (_step < 2) {
      setState(() => _step++);
    } else {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Assignment published.')));
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
    } else {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return LecturerPageScaffold(
      title: 'New Assignment',
      child: Column(
        children: [
          // Step indicator
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
            child: Row(
              children: [
                _StepDot(label: 'Info', active: _step == 0, done: _step > 0),
                _StepLine(done: _step > 0),
                _StepDot(label: 'Grading', active: _step == 1, done: _step > 1),
                _StepLine(done: _step > 1),
                _StepDot(label: 'Files', active: _step == 2, done: false),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: switch (_step) {
              0 => _InfoStep(
                title: _title,
                description: _description,
                course: _course,
                courses: _courses,
                onCourseChanged: (v) => setState(() => _course = v),
              ),
              1 => _GradingStep(
                dueDate: _dueDate,
                dueTime: _dueTime,
                points: _points,
                weight: _weight,
              ),
              _ => const _FilesStep(),
            },
          ),
          // Footer actions
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            decoration: const BoxDecoration(
              color: LecturerColors.surfaceLowest,
              border: Border(
                top: BorderSide(color: LecturerColors.outlineVariant),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _back,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: LecturerColors.primary,
                      side: const BorderSide(color: LecturerColors.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      _step == 0 ? 'Cancel' : 'Back',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: FilledButton.icon(
                    onPressed: _next,
                    icon: Icon(
                      _step == 2 ? Icons.send : Icons.arrow_forward,
                      size: 18,
                    ),
                    label: Text(
                      _step == 2 ? 'Publish Assignment' : 'Next Step',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    style: FilledButton.styleFrom(
                      backgroundColor: LecturerColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
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

class _StepDot extends StatelessWidget {
  const _StepDot({
    required this.label,
    required this.active,
    required this.done,
  });

  final String label;
  final bool active;
  final bool done;

  @override
  Widget build(BuildContext context) {
    final color = active || done
        ? LecturerColors.primary
        : LecturerColors.outline;
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: done ? LecturerColors.primary : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 1.6),
          ),
          child: Icon(
            done ? Icons.check : Icons.circle,
            size: done ? 14 : 8,
            color: done ? Colors.white : color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: active || done
                ? LecturerColors.primary
                : LecturerColors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _StepLine extends StatelessWidget {
  const _StepLine({required this.done});

  final bool done;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 20),
        color: done ? LecturerColors.primary : LecturerColors.outlineVariant,
      ),
    );
  }
}

class _InfoStep extends StatelessWidget {
  const _InfoStep({
    required this.title,
    required this.description,
    required this.course,
    required this.courses,
    required this.onCourseChanged,
  });

  final TextEditingController title;
  final TextEditingController description;
  final String course;
  final List<String> courses;
  final ValueChanged<String> onCourseChanged;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      children: [
        const _FieldLabel('Assignment Title'),
        TextField(
          controller: title,
          decoration: _inputDeco(hint: 'e.g. Mid-term Case Study'),
        ),
        const SizedBox(height: 16),
        const _FieldLabel('Course Selection'),
        DropdownButtonFormField<String>(
          initialValue: course,
          items: [
            for (final c in courses) DropdownMenuItem(value: c, child: Text(c)),
          ],
          onChanged: (v) {
            if (v != null) onCourseChanged(v);
          },
          icon: const Icon(Icons.expand_more, color: LecturerColors.primary),
          decoration: _inputDeco(),
        ),
        const SizedBox(height: 16),
        const _FieldLabel('Description'),
        TextField(
          controller: description,
          maxLines: 4,
          decoration: _inputDeco(
            hint: 'Describe the assignment, expectations, and rubric\u2026',
          ),
        ),
      ],
    );
  }
}

class _GradingStep extends StatelessWidget {
  const _GradingStep({
    required this.dueDate,
    required this.dueTime,
    required this.points,
    required this.weight,
  });

  final TextEditingController dueDate;
  final TextEditingController dueTime;
  final TextEditingController points;
  final TextEditingController weight;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      children: [
        Row(
          children: [
            const Icon(Icons.event, size: 18, color: LecturerColors.primary),
            const SizedBox(width: 8),
            const Text(
              'Submission Window',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _FieldLabel('Due Date'),
                  TextField(
                    controller: dueDate,
                    readOnly: true,
                    onTap: () => _pickDate(context),
                    decoration: _inputDeco(
                      hint: 'Oct 15, 2024',
                      suffix: Icons.calendar_today_outlined,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _FieldLabel('Due Time'),
                  TextField(
                    controller: dueTime,
                    readOnly: true,
                    onTap: () => _pickTime(context),
                    decoration: _inputDeco(
                      hint: '11:59 PM',
                      suffix: Icons.schedule,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const _FieldLabel('Points Value'),
        TextField(
          controller: points,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: _inputDeco(hint: '100', suffixText: 'PTS'),
        ),
        const SizedBox(height: 16),
        const _FieldLabel('Weight (%)'),
        TextField(
          controller: weight,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: _inputDeco(hint: '15'),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: LecturerColors.secondaryFixedDim.withValues(alpha: 0.25),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.info_outline,
                size: 16,
                color: LecturerColors.secondary,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'This assignment will contribute 15% to the final semester '
                  'grade for the selected course.',
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: LecturerColors.onSecondaryContainer,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

Future<void> _pickDate(BuildContext context) async {
  final now = DateTime.now();
  final picked = await showDatePicker(
    context: context,
    initialDate: now,
    firstDate: now,
    lastDate: now.add(const Duration(days: 365)),
  );
  if (picked != null && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Due date set to ${_fmtDate(picked)}.')),
    );
  }
}

Future<void> _pickTime(BuildContext context) async {
  final now = TimeOfDay.now();
  final picked = await showTimePicker(context: context, initialTime: now);
  if (picked != null && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Due time set to ${picked.format(context)}.')),
    );
  }
}

String _fmtDate(DateTime d) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[d.month - 1]} ${d.day}, ${d.year}';
}

class _FilesStep extends StatelessWidget {
  const _FilesStep();

  static const _files = [
    (Icons.picture_as_pdf_outlined, 'Assignment_Brief_V2.pdf', '1.2 MB'),
    (Icons.description_outlined, 'Dataset_Q3_Physics.xlsx', '450 KB'),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      children: [
        Container(
          padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(
            color: LecturerColors.surfaceLowest,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: LecturerColors.outlineVariant,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              const Icon(
                Icons.cloud_upload_outlined,
                size: 42,
                color: LecturerColors.primary,
              ),
              const SizedBox(height: 8),
              const Text(
                'Click or Drag Files',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'PDF, DOCX, ZIP up to 50MB',
                style: TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'ADDED FILES',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
            color: LecturerColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 10),
        for (final (icon, name, size) in _files) ...[
          _FileRow(icon: icon, name: name, size: size),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _FileRow extends StatelessWidget {
  const _FileRow({required this.icon, required this.name, required this.size});

  final IconData icon;
  final String name;
  final String size;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: LecturerColors.surfaceLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: LecturerColors.outlineVariant),
      ),
      child: Row(
        children: [
          Icon(icon, size: 22, color: LecturerColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: LecturerColors.primary,
                  ),
                ),
                Text(
                  size,
                  style: const TextStyle(
                    fontSize: 11,
                    color: LecturerColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('File removed.')));
            },
            icon: const Icon(
              Icons.delete_outline,
              size: 20,
              color: LecturerColors.error,
            ),
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: LecturerColors.onSurfaceVariant,
        ),
      ),
    );
  }
}

InputDecoration _inputDeco({
  String? hint,
  IconData? suffix,
  String? suffixText,
}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(fontSize: 13, color: LecturerColors.outline),
    suffixIcon: suffix != null
        ? Icon(suffix, size: 18, color: LecturerColors.outline)
        : null,
    suffixText: suffixText,
    suffixStyle: const TextStyle(
      fontSize: 12,
      color: LecturerColors.onSurfaceVariant,
    ),
    filled: true,
    fillColor: LecturerColors.surfaceLowest,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: LecturerColors.outlineVariant),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: LecturerColors.primary),
    ),
  );
}
