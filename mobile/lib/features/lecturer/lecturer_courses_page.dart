import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/models/api/course.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import 'lecturer_colors.dart';
import 'lecturer_controller.dart';
import 'lecturer_scaffold.dart';
import 'lecturer_widgets.dart';

/// Lecturer course list — search field plus semester filter chips, and course
/// cards showing enrollment, syllabus progress, and a detail chevron.
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

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<String> _semesters(List<ApiCourse> courses) {
    final seen = <String>{};
    for (final c in courses) {
      final semester = c.semester;
      if (semester != null && semester.trim().isNotEmpty) {
        seen.add(semester.trim());
      }
    }
    return seen.toList();
  }

  List<ApiCourse> _apply(List<ApiCourse> courses) {
    var result = courses;
    if (_filter != 'All') {
      result =
          result.where((c) => c.semester == _filter || c.semester?.contains(_filter) == true).toList();
    }
    if (_query.trim().isNotEmpty) {
      final q = _query.trim().toLowerCase();
      result = result
          .where(
            (c) =>
                c.code.toLowerCase().contains(q) ||
                c.title.toLowerCase().contains(q),
          )
          .toList();
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final coursesAsync = ref.watch(lecturerApiCoursesProvider);

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
          if (coursesAsync.value != null) ...[
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _semesters(coursesAsync.value!.items).length + 1,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final semesters = _semesters(coursesAsync.value!.items);
                  final f = i == 0 ? 'All' : semesters[i - 1];
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
          ],
          Expanded(
            child: coursesAsync.isLoading
                ? const _CoursesLoading()
                : coursesAsync.hasError
                    ? _CoursesError(
                        onRetry: () => ref.invalidate(lecturerApiCoursesProvider),
                      )
                    : _CoursesBody(courses: _apply(coursesAsync.value!.items)),
          ),
        ],
      ),
    );
  }
}

class _CoursesBody extends StatelessWidget {
  const _CoursesBody({required this.courses});

  final List<ApiCourse> courses;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) return const _CoursesEmpty();
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
      itemCount: courses.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, i) => _CourseCard(course: courses[i]),
    );
  }
}

class _CoursesLoading extends StatelessWidget {
  const _CoursesLoading();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
      itemCount: 3,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, _) =>
          const LecturerSkeletonBlock(height: 132, radius: 14),
    );
  }
}

class _CoursesError extends StatelessWidget {
  const _CoursesError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              size: 34,
              color: LecturerColors.error,
            ),
            const SizedBox(height: 12),
            const Text(
              'Could not load your courses',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: LecturerColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            TextButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

class _CoursesEmpty extends StatelessWidget {
  const _CoursesEmpty();

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
            const Text(
              'No courses match this filter.',
              textAlign: TextAlign.center,
              style: TextStyle(
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

class _CourseCard extends ConsumerWidget {
  const _CourseCard({required this.course});

  final ApiCourse course;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final completion =
        ref.watch(lecturerCourseProgressProvider(course.id)).value ?? 0;
    final enrolled = '${course.enrolledCount} Students Enrolled';

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
                course.title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: LecturerColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                course.semester?.isNotEmpty == true
                    ? '${course.semester} \u2022 ${course.lecturerName}'
                    : course.lecturerName,
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
