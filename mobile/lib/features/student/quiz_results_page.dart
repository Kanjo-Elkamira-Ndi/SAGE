import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_button.dart';
import '../../shared/widgets/sage_card.dart';
import '../../shared/widgets/sage_circular_progress.dart';
import 'student_colors.dart';
import 'student_controller.dart';

/// Carried from the in-progress page to the results page via go_router `extra`.
class QuizResultsPayload {
  const QuizResultsPayload(this.score, this.answers);

  final int score;
  final List<int?> answers;
}

/// Quiz results — score ring, grade, and per-question review with
/// correct/incorrect callouts (Stitch quiz results screen).
class QuizResultsPage extends ConsumerWidget {
  const QuizResultsPage({super.key, required this.quizId});

  final String quizId;

  static const _questions = <QuizQuestion>[
    QuizQuestion(
      text: 'Which data structure uses FIFO ordering?',
      options: ['Stack', 'Queue', 'Linked List', 'Hash Table'],
      answerIndex: 1,
    ),
    QuizQuestion(
      text: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      answerIndex: 2,
    ),
    QuizQuestion(
      text: 'Which sorting algorithm has the best average case?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      answerIndex: 2,
    ),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quiz = ref.watch(studentControllerProvider.notifier).quizById(quizId);
    final payload = GoRouterState.of(context).extra as QuizResultsPayload?;
    final score = payload?.score ?? quiz.score ?? 0;
    final answers = payload?.answers ?? [];
    final grade = switch (score) {
      >= 90 => 'A',
      >= 80 => 'B',
      >= 70 => 'C',
      >= 60 => 'D',
      _ => 'F',
    };
    final passed = score >= 70;

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
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text(
            quiz.title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: StudentColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            quiz.course,
            style: const TextStyle(
              fontSize: 13,
              color: StudentColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),

          // Score ring
          Center(
            child: SageCircularProgress(
              value: score / 100,
              size: 132,
              strokeWidth: 12,
              color: passed ? StudentColors.success : StudentColors.error,
              label: '$score%',
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
                  color: passed
                      ? StudentColors.success
                      : StudentColors.error,
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
          for (var i = 0; i < _questions.length; i++)
            _ReviewCard(
              question: _questions[i],
              chosenIndex: i < answers.length ? answers[i] : null,
            ),
          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: SageButton(
                  variant: SageButtonVariant.outline,
                  onPressed: () => context.go('/student/quiz/${quiz.id}'),
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
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.question, required this.chosenIndex});

  final QuizQuestion question;
  final int? chosenIndex;

  @override
  Widget build(BuildContext context) {
    final correct = chosenIndex == question.answerIndex;

    return SageCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                correct
                    ? Icons.check_circle
                    : chosenIndex == null
                        ? Icons.help_outline
                        : Icons.cancel,
                size: 18,
                color: correct
                    ? StudentColors.success
                    : StudentColors.error,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  question.text,
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
            'Correct answer: ${question.options[question.answerIndex]}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: StudentColors.success,
            ),
          ),
          if (chosenIndex != null && chosenIndex != question.answerIndex) ...[
            const SizedBox(height: 4),
            Text(
              'Your answer: ${question.options[chosenIndex!]}',
              style: const TextStyle(
                fontSize: 12,
                color: StudentColors.error,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
