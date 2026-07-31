import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_empty_state.dart';
import '../../shared/widgets/sage_progress_bar.dart';
import '../../shared/widgets/sage_stat_card.dart';
import '../auth/auth_controller.dart';
import 'student_shell.dart';

/// Phase 0/1 placeholder home. Replaced by the real student dashboard in
/// Phase 3. Demos the shared widget library.
class StudentHomePage extends ConsumerWidget {
  const StudentHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return AppShell(
      title: StudentShell.title,
      destinations: StudentShell.destinations,
      drawerSections: StudentShell.drawerSections,
      notificationPath: StudentShell.notificationPath,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Good morning, ${user?.fullName.split(' ').first ?? 'there'}!',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          const Text(
            "Here's your learning overview",
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          const Row(
            children: [
              Expanded(
                child: SageStatCard(
                  icon: Icons.menu_book_outlined,
                  label: 'Active Courses',
                  value: '4',
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: SageStatCard(
                  icon: Icons.task_alt,
                  label: 'Assignments Done',
                  value: '12',
                  iconColor: AppColors.success,
                  iconBackground: AppColors.successSubtle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Row(
            children: [
              Expanded(
                child: SageStatCard(
                  icon: Icons.hourglass_top,
                  label: 'Pending Tasks',
                  value: '3',
                  iconColor: AppColors.accentHover,
                  iconBackground: AppColors.accentSubtle,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: SageStatCard(
                  icon: Icons.emoji_events_outlined,
                  label: 'Avg. Score',
                  value: '87%',
                  iconColor: AppColors.info,
                  iconBackground: AppColors.infoSubtle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SageCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Courses in Progress',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Expanded(
                      child: SageCard(
                        padding: EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Introduction to CS',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 8),
                            SageProgressBar(value: 0.72),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Expanded(
                      child: SageCard(
                        padding: EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Data Structures & Algorithms',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 8),
                            SageProgressBar(value: 0.45),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Expanded(
                      child: SageCard(
                        padding: EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Linear Algebra',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 8),
                            SageProgressBar(value: 0.9),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Generic placeholder for student tabs not yet built (Phase 3).
class StudentPlaceholderPage extends StatelessWidget {
  const StudentPlaceholderPage({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: StudentShell.title,
      destinations: StudentShell.destinations,
      drawerSections: StudentShell.drawerSections,
      notificationPath: StudentShell.notificationPath,
      child: SageEmptyState(
        icon: Icons.construction_outlined,
        title: title,
        description: 'This screen is coming in the next phase.',
      ),
    );
  }
}
