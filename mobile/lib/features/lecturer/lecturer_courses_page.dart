import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/models/lecturer.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';

/// Lecturer course list — search field plus semester/level filter chips, and
/// course cards showing enrollment, syllabus progress, and a detail chevron.
class LecturerCoursesPage extends ConsumerStatefulWidget {
  const LecturerCoursesPage({super.key});

  @override
  ConsumerState<LecturerCoursesPage> createState() =>
      _LecturerCoursesPageState();
}

class _LecturerCoursesPageState extends ConsumerState<LecturerCoursesPage> {
  final _search = TextEditingController();
  String _query = '';
  String _filter = 'All';

  static const _filters = ['All', 'Fall 2024', 'Spring 2025'];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<LecturerCourse> _apply(List<LecturerCourse> courses) {
    var result = courses;
    if (_filter != 'All') {
      result = result
          .where((c) => c.semester.contains(_filter.split(' ').first))
          .toList();
    }
    if (_query.trim().isNotEmpty) {
      final q = _query.trim().toLowerCase();
      result = result
          .where(
            (c) =>
                c.code.toLowerCase().contains(q) ||
                c.name.toLowerCase().contains(q),
          )
          .toList();
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final courses = ref.watch(lecturerControllerProvider.notifier).courses;
    final visible = _apply(courses);

    return LecturerPageScaffold(
      title: 'My Courses',
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
            child: TextField(
              controller: _search,
              onChanged: (v) => setState(() => _query = v),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Search courses',
                prefixIcon: const Icon(Icons.search, size: 20),
                filled: true,
                fillColor: LecturerColors.surfaceLowest,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: LecturerColors.outlineVariant,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: LecturerColors.outlineVariant,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: LecturerColors.primary),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _filters.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final f = _filters[i];
                final selected = f == _filter;
                return ChoiceChip(
                  label: Text(f),
                  selected: selected,
                  onSelected: (_) => setState(() => _filter = f),
                  showCheckmark: false,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: selected
                        ? LecturerColors.primary
                        : LecturerColors.onSurfaceVariant,
                  ),
                  backgroundColor: LecturerColors.surfaceLowest,
                  selectedColor: LecturerColors.secondaryContainer,
                  side: BorderSide(
                    color: selected
                        ? LecturerColors.primary
                        : LecturerColors.outlineVariant,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: visible.isEmpty
                ? _CoursesEmpty(query: _query)
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                    itemCount: visible.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, i) =>
                        _CourseCard(course: visible[i]),
                  ),
          ),
        ],
      ),
    );
  }
}

class _CoursesEmpty extends StatelessWidget {
  const _CoursesEmpty({required this.query});

  final String query;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: LecturerColors.surfaceContainer,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off,
                size: 34,
                color: LecturerColors.outline,
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'No courses found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              query.trim().isEmpty
                  ? 'No courses match this filter.'
                  : 'No results for \u201C$query\u201D.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: LecturerColors.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course});

  final LecturerCourse course;

  @override
  Widget build(BuildContext context) {
    final enrolled = '${course.studentsEnrolled} Students Enrolled';
    final completion = course.syllabusCompletion;

    return Material(
      color: LecturerColors.surfaceLowest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () =>
            context.push('/lecturer/course_management', extra: course.id),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: LecturerColors.outlineVariant),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: LecturerColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      course.code,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: LecturerColors.onPrimary,
                      ),
                    ),
                  ),
                  const Spacer(),
                  const Icon(
                    Icons.chevron_right,
                    size: 20,
                    color: LecturerColors.outline,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                course.name,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${course.semester} \u2022 Level ${course.level}',
                style: const TextStyle(
                  fontSize: 12,
                  color: LecturerColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(
                    Icons.people_outline,
                    size: 14,
                    color: LecturerColors.outline,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    enrolled,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: LecturerColors.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${(completion * 100).round()}% Syllabus',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: LecturerColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SageProgressBar(value: completion, height: 6, showPercent: false),
            ],
          ),
        ),
      ),
    );
  }
}
