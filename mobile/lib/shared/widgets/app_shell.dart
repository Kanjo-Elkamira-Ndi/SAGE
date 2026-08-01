import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../features/auth/auth_controller.dart';

/// A single navigable destination in the shell (bottom nav or drawer).
class ShellDestination {
  const ShellDestination({
    required this.label,
    required this.icon,
    required this.path,
    this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData? selectedIcon;
  final String path;
}

/// A titled group of drawer items (e.g. "Academic Support").
class ShellDrawerSection {
  const ShellDrawerSection({this.title, required this.items});

  final String? title;
  final List<ShellDestination> items;
}

/// App shell: top bar + drawer + bottom navigation, driven by configuration so
/// both roles reuse the same frame (see `mobile-roadmap.md` Phase 1).
class AppShell extends ConsumerWidget {
  const AppShell({
    super.key,
    required this.title,
    required this.destinations,
    required this.drawerSections,
    required this.child,
    this.notificationPath,
    this.appBarColor = AppColors.primary,
    this.appBarForeground = Colors.white,
    this.bodyBackground = AppColors.background,
    this.navActiveBackground,
    this.navActiveForeground,
    this.avatarImage,
  });

  final String title;
  final List<ShellDestination> destinations;
  final List<ShellDrawerSection> drawerSections;
  final Widget child;
  final String? notificationPath;

  /// Top bar + bottom nav theming. Defaults keep the Phase-1 brand look;
  /// the student role overrides with the SAGE student design tokens.
  final Color appBarColor;
  final Color appBarForeground;
  final Color bodyBackground;
  final Color? navActiveBackground;
  final Color? navActiveForeground;
  final ImageProvider? avatarImage;

  int _activeIndex(BuildContext context, String currentPath) {
    for (var i = 0; i < destinations.length; i++) {
      final path = destinations[i].path;
      if (currentPath == path || currentPath.startsWith('$path/')) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;

    final avatarUrl = user?.avatarUrl;
    final effectiveAvatar = avatarImage ??
        (avatarUrl == null
            ? null
            : avatarUrl.startsWith('assets/')
                ? AssetImage(avatarUrl)
                : NetworkImage(avatarUrl));

    return Scaffold(
      backgroundColor: bodyBackground,
      appBar: AppBar(
        backgroundColor: appBarColor,
        foregroundColor: appBarForeground,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: appBarForeground,
        ),
        title: Text(title),
        actions: [
          IconButton(
            icon: Icon(Icons.search, color: appBarForeground),
            tooltip: 'Search',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Search coming soon.')),
              );
            },
          ),
          IconButton(
            icon: Badge(
              backgroundColor: AppColors.accent,
              smallSize: 9,
              child: Icon(Icons.notifications_none, color: appBarForeground),
            ),
            tooltip: 'Notifications',
            onPressed: () {
              final path = notificationPath;
              if (path == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Notifications coming soon.')),
                );
              } else {
                context.go(path);
              }
            },
          ),
          const SizedBox(width: 4),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              backgroundImage: effectiveAvatar,
              child: effectiveAvatar == null
                  ? Text(
                      user?.initials ?? 'S',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: appBarForeground,
                      ),
                    )
                  : null,
            ),
          ),
        ],
      ),
      drawer: _SageDrawer(drawerSections: drawerSections),
      body: SafeArea(child: child),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: bodyBackground,
          indicatorColor: navActiveBackground,
          iconTheme: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return IconThemeData(
              size: 24,
              color: selected
                  ? (navActiveForeground ?? AppColors.primary)
                  : AppColors.textSecondary,
            );
          }),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return TextStyle(
              fontSize: 12,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              color: selected
                  ? (navActiveForeground ?? AppColors.primary)
                  : AppColors.textSecondary,
            );
          }),
        ),
        child: NavigationBar(
          selectedIndex: _activeIndex(context, currentPath),
          onDestinationSelected: (index) {
            final path = destinations[index].path;
            if (currentPath != path) context.go(path);
          },
          destinations: [
            for (final d in destinations)
              NavigationDestination(
                icon: Icon(d.icon),
                selectedIcon: Icon(d.selectedIcon ?? d.icon),
                label: d.label,
              ),
          ],
        ),
      ),
    );
  }
}

class _SageDrawer extends ConsumerWidget {
  const _SageDrawer({required this.drawerSections});

  final List<ShellDrawerSection> drawerSections;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final currentPath = GoRouterState.of(context).matchedLocation;

    void navigate(ShellDestination d) {
      Navigator.of(context).pop();
      if (currentPath != d.path) context.go(d.path);
    }

    return Drawer(
      backgroundColor: AppColors.primary,
      child: SafeArea(
        child: Column(
          children: [
            // Branding
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              width: double.infinity,
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'S',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'EduPortal',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Academic Management',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white54,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(color: Colors.white12, height: 1),

            // Sections
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12),
                children: [
                  for (final section in drawerSections) ...[
                    if (section.title != null)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 6),
                        child: Text(
                          section.title!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: Colors.white38,
                          ),
                        ),
                      ),
                    for (final item in section.items)
                      _DrawerItem(
                        destination: item,
                        active:
                            currentPath == item.path ||
                            currentPath.startsWith('${item.path}/'),
                        onTap: () => navigate(item),
                      ),
                  ],
                ],
              ),
            ),

            // User footer
            Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Colors.white12)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: Colors.white.withValues(alpha: 0.15),
                    child: Text(
                      user?.initials ?? 'S',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.fullName ?? 'Guest',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          user?.email ?? '',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.white54,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout, color: Colors.white70),
                    tooltip: 'Sign out',
                    onPressed: () async {
                      Navigator.of(context).pop();
                      await ref.read(authControllerProvider.notifier).signOut();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  const _DrawerItem({
    required this.destination,
    required this.active,
    required this.onTap,
  });

  final ShellDestination destination;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(
        destination.icon,
        size: 20,
        color: active ? Colors.white : Colors.white70,
      ),
      title: Text(
        destination.label,
        style: TextStyle(
          fontSize: 14,
          fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          color: active ? Colors.white : Colors.white70,
        ),
      ),
      selected: active,
      selectedTileColor: Colors.white.withValues(alpha: 0.12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
    );
  }
}
