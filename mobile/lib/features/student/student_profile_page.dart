import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/sage_colors.dart';
import '../../shared/widgets/sage_badge.dart';
import '../../shared/widgets/sage_card.dart';
import '../auth/auth_controller.dart';
import 'student_colors.dart';
import 'student_scaffold.dart';

/// Student profile — avatar header + academic details list.
class StudentProfilePage extends ConsumerWidget {
  const StudentProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Profile',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 20),

          SageCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: StudentColors.primaryContainer,
                  backgroundImage: user?.avatarUrl?.startsWith('assets/') == true
                      ? AssetImage(user!.avatarUrl!)
                      : null,
                  child: user?.avatarUrl?.startsWith('assets/') == true
                      ? null
                      : Text(
                          user?.initials ?? 'S',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                ),
                const SizedBox(height: 12),
                Text(
                  user?.fullName ?? 'Alex Carter',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: StudentColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Undergraduate \u00b7 Computer Science',
                  style: TextStyle(
                    fontSize: 13,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 10),
                const SageBadge(
                  label: 'Active Student',
                  variant: SageBadgeVariant.success,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          SageCard(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: const [
                _ProfileTile(
                  icon: Icons.badge_outlined,
                  label: 'Student ID',
                  value: 'SAGE20230148',
                ),
                Divider(height: 1, indent: 56),
                _ProfileTile(
                  icon: Icons.school_outlined,
                  label: 'Program',
                  value: 'B.Sc. Computer Science',
                ),
                Divider(height: 1, indent: 56),
                _ProfileTile(
                  icon: Icons.calendar_today_outlined,
                  label: 'Semester',
                  value: 'Fall 2025',
                ),
                Divider(height: 1, indent: 56),
                _ProfileTile(
                  icon: Icons.star_outline,
                  label: 'GPA',
                  value: '3.7 / 4.0',
                ),
                Divider(height: 1, indent: 56),
                _ProfileTile(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  value: 'alex.carter@student.sage.edu',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  const _ProfileTile({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 20, color: StudentColors.primary),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          color: StudentColors.onSurfaceVariant,
        ),
      ),
      trailing: Text(
        value,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
    );
  }
}
