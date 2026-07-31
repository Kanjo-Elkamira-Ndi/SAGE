import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/sage_empty_state.dart';
import '../../shared/widgets/sage_stat_card.dart';
import '../auth/auth_controller.dart';
import 'lecturer_shell.dart';

/// Phase 0/1 placeholder home. Replaced by the real lecturer dashboard in
/// Phase 4. Demos the shared widget library.
class LecturerHomePage extends ConsumerWidget {
  const LecturerHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return AppShell(
      title: LecturerShell.title,
      destinations: LecturerShell.destinations,
      drawerSections: LecturerShell.drawerSections,
      notificationPath: LecturerShell.notificationPath,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Good morning, ${user?.fullName.split(' ').first ?? 'there'}!',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          const Text(
            "Here's an overview of your courses",
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          const Row(
            children: [
              Expanded(
                child: SageStatCard(
                  icon: Icons.menu_book_outlined,
                  label: 'Active Courses',
                  value: '3',
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: SageStatCard(
                  icon: Icons.group_outlined,
                  label: 'Total Students',
                  value: '128',
                  iconColor: AppColors.info,
                  iconBackground: AppColors.infoSubtle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Row(
            children: [
              Expanded(
                child: SageStatCard(
                  icon: Icons.fact_check_outlined,
                  label: 'Pending Grades',
                  value: '14',
                  iconColor: AppColors.accentHover,
                  iconBackground: AppColors.accentSubtle,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: SageStatCard(
                  icon: Icons.emoji_events_outlined,
                  label: 'Course Average',
                  value: '84%',
                  iconColor: AppColors.success,
                  iconBackground: AppColors.successSubtle,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Generic placeholder for lecturer tabs not yet built (Phase 4).
class LecturerPlaceholderPage extends StatelessWidget {
  const LecturerPlaceholderPage({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: LecturerShell.title,
      destinations: LecturerShell.destinations,
      drawerSections: LecturerShell.drawerSections,
      notificationPath: LecturerShell.notificationPath,
      child: SageEmptyState(
        icon: Icons.construction_outlined,
        title: title,
        description: 'This screen is coming in the next phase.',
      ),
    );
  }
}
