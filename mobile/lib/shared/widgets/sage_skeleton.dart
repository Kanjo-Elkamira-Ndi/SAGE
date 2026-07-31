import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';

/// Pulsing placeholder for content that is still loading.
class SageSkeleton extends StatefulWidget {
  const SageSkeleton({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  final double width;
  final double height;
  final double borderRadius;

  @override
  State<SageSkeleton> createState() => _SageSkeletonState();
}

class _SageSkeletonState extends State<SageSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween(begin: 0.45, end: 1.0).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
      ),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(widget.borderRadius),
        ),
      ),
    );
  }
}

/// Convenience: a single card-shaped skeleton block.
class SageSkeletonCard extends StatelessWidget {
  const SageSkeletonCard({super.key, this.lines = 3});

  final int lines;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SageSkeleton(width: 40, height: 40, borderRadius: 10),
          const SizedBox(height: 12),
          const SageSkeleton(width: 180, height: 14),
          const SizedBox(height: 8),
          for (var i = 0; i < lines - 1; i++) ...[
            const SageSkeleton(height: 12),
            const SizedBox(height: 6),
          ],
        ],
      ),
    );
  }
}
