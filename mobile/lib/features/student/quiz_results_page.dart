import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/api/quiz.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_circular_progress.dart';
import 'student_colors.dart';
import 'student_controller.dart';
import 'student_widgets.dart';

/// Quiz results — score ring, grade, and per-question review with
/// correct/incorrect callouts (Stitch quiz results screen). Wired to
/// `GET /quizzes/:id/results` (`api-wiring-plan.md` §A.3).
class QuizResultsPage extends ConsumerWidget {
  const QuizResultsPage({super.key, required this.quizId});

  final String quizId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultsAsync = ref.watch(apiQuizResultsProvider(quizId));

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: const Text(
          'Quiz Results',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
      ),
      body: resultsAsync.hasError
          ? StudentEmptyState(
              icon: Icons.cloud_off_outlined,
              title: 'Could not load results',
              description: 'Check your connection and try again.',
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(apiQuizResultsProvider(quizId)),
            )
          : resultsAsync.value == null
              ? const Center(
                  child: CircularProgressIndicator(color: StudentColors.primary),
                )
              : _ResultsBody(results: resultsAsync.value!, quizId: quizId),
    );
  }
}

class _ResultsBody extends StatelessWidget {
  const _ResultsBody({required this.results, required this.quizId});

  final ApiQuizResultsDetail results;
  final String quizId;

  @override
  Widget build(BuildContext context) {
    final percent = results.total > 0
        ? (results.score / results.total * 100).round()
        : 0;
    final grade = switch (percent) {
      >= 90 => 'A',
      >= 80 => 'B',
      >= 70 => 'C',
      >= 60 => 'D',
      _ => 'F',
    };
    final passed = percent >= 70;
    final questions = results.questions;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Text(
          results.title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${results.correctCount}/${results.questionCount} correct',
          style: const TextStyle(
            fontSize: 13,
            color: StudentColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),

        // Score ring
        Center(
          child: SageCircularProgress(
            value: percent / 100,
            size: 132,
            strokeWidth: 12,
            color: passed ? StudentColors.success : StudentColors.error,
            label: '$percent%',
            subLabel: 'Grade $grade',
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: passed
                  ? StudentColors.successSoft
                  : StudentColors.errorContainer,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              passed ? 'Passed \u2014 great work!' : 'Needs improvement',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: passed ? StudentColors.success : StudentColors.error,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),

        const Text(
          'Question Review',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
        const SizedBox(height: 10),
        for (final question in questions) ...[
          _ReviewCard(question: question),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              child: SageButton(
                variant: SageButtonVariant.outline,
                onPressed: () => context.go('/student/quiz/$quizId'),
                child: const Text('Retry Quiz'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SageButton(
                variant: SageButtonVariant.accent,
                onPressed: () => context.go('/student/tasks'),
                child: const Text('Back to Tasks'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.question});

  final ApiQuizReviewQuestion question;

  @override
  Widget build(BuildContext context) {
    final options = question.options ?? const <String>[];
    final chosenIndex = options.indexOf(question.yourAnswer);
    final correctIndex = options.indexOf(question.correctAnswer);
    final answered = chosenIndex >= 0;

    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                question.correct
                    ? Icons.check_circle
                    : !answered
                        ? Icons.help_outline
                        : Icons.cancel,
                size: 18,
                color: question.correct
                    ? StudentColors.success
                    : StudentColors.error,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  question.questionText,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            question.correctAnswer.isEmpty
                ? 'Correct answer: ${correctIndex >= 0 ? options[correctIndex] : '—'}'
                : 'Correct answer: ${question.correctAnswer}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: StudentColors.success,
            ),
          ),
          if (answered && !question.correct) ...[
            const SizedBox(height: 4),
            Text(
              'Your answer: ${question.yourAnswer}',
              style: const TextStyle(
                fontSize: 12,
                color: StudentColors.error,
              ),
            ),
          ] else if (!answered) ...[
            const SizedBox(height: 4),
            const Text(
              'Not answered',
              style: TextStyle(fontSize: 12, color: StudentColors.error),
            ),
          ],
        ],
      ),
    );
  }
}
