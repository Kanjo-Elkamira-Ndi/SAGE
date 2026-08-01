import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/sage_card.dart';
import '../auth/auth_controller.dart';
import 'student_colors.dart';
import 'student_scaffold.dart';
import 'student_widgets.dart';

/// Settings — notification toggles, preferences, and account actions.
class StudentSettingsPage extends ConsumerWidget {
  const StudentSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return StudentPageScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const Text(
            'Settings',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 16),

          const StudentSectionHeader(title: 'Notifications'),
          const SizedBox(height: 8),
          const SageCard(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Column(
              children: [
                _SettingTile(
                  icon: Icons.campaign_outlined,
                  title: 'Announcements',
                  subtitle: 'Course-wide notices',
                  value: true,
                ),
                Divider(height: 1, indent: 56),
                _SettingTile(
                  icon: Icons.event_outlined,
                  title: 'Deadline reminders',
                  subtitle: '24h before each due date',
                  value: true,
                ),
                Divider(height: 1, indent: 56),
                _SettingTile(
                  icon: Icons.grade_outlined,
                  title: 'Grade updates',
                  subtitle: 'When results are published',
                  value: false,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const StudentSectionHeader(title: 'Preferences'),
          const SizedBox(height: 8),
          const SageCard(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Column(
              children: [
                _SettingTile(
                  icon: Icons.dark_mode_outlined,
                  title: 'Dark mode',
                  subtitle: 'Coming in a later phase',
                  value: false,
                ),
                Divider(height: 1, indent: 56),
                _SettingTile(
                  icon: Icons.language_outlined,
                  title: 'Language',
                  subtitle: 'English (UK)',
                  value: false,
                  trailing: null,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          SageCard(
            padding: const EdgeInsets.all(16),
            onTap: () async {
              await ref.read(authControllerProvider.notifier).signOut();
            },
            child: const Row(
              children: [
                Icon(Icons.logout, size: 20, color: StudentColors.error),
                SizedBox(width: 12),
                Text(
                  'Sign out',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: StudentColors.error,
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

class _SettingTile extends StatelessWidget {
  const _SettingTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;

  /// When non-null, renders this instead of a switch (e.g. a chevron).
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 20, color: StudentColors.primary),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: StudentColors.primary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 12,
          color: StudentColors.onSurfaceVariant,
        ),
      ),
      trailing: trailing ??
          Switch(
            value: value,
            onChanged: (_) {},
            activeTrackColor: StudentColors.primary,
            activeThumbColor: Colors.white,
          ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    );
  }
}
