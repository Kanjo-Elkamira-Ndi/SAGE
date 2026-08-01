import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/student.dart';
import '../../shared/widgets/sage_button.dart';
import 'quiz_results_page.dart';
import 'student_colors.dart';
import 'student_controller.dart';

/// Quiz attempt screen — question stepper with A–D options, progress, and a
/// finishing flow that hands the score to the results page (Stitch quiz screen).
class QuizInProgressPage extends ConsumerStatefulWidget {
  const QuizInProgressPage({super.key, required this.quizId});

  final String quizId;

  @override
  ConsumerState<QuizInProgressPage> createState() => _QuizInProgressPageState();
}

class _QuizInProgressPageState extends ConsumerState<QuizInProgressPage> {
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

  int _index = 0;
  int? _selected;
  final List<int?> _answers = [];

  @override
  Widget build(BuildContext context) {
    final quiz = ref.watch(studentControllerProvider.notifier).quizById(widget.quizId);
    final question = _questions[_index];

    void next() {
      if (_selected == null) return;
      _answers.add(_selected);
      if (_index == _questions.length - 1) {
        var correct = 0;
        for (var i = 0; i < _answers.length; i++) {
          if (_answers[i] == _questions[i].answerIndex) correct++;
        }
        final score = (100 * correct / _questions.length).round();
        context.go('/student/quiz-results/${quiz.id}',
            extra: QuizResultsPayload(score, _answers));
        return;
      }
      setState(() {
        _index += 1;
        _selected = null;
      });
    }

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: Text(
          quiz.title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: StudentColors.primary,
          ),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '1 attempt',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: StudentColors.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: (_index + 1) / _questions.length,
                      minHeight: 6,
                      backgroundColor: StudentColors.surfaceHighest,
                      valueColor: const AlwaysStoppedAnimation(StudentColors.primary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${_index + 1}/${_questions.length}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: StudentColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: StudentColors.tertiaryFixed,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.timer_outlined,
                    size: 18,
                    color: StudentColors.primary,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Time left: 03:24',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: StudentColors.primary,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${quiz.durationMins} min quiz',
                    style: const TextStyle(
                      fontSize: 12,
                      color: StudentColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Question ${_index + 1}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
                color: StudentColors.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              question.text,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: StudentColors.primary,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                children: [
                  for (var i = 0; i < question.options.length; i++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _OptionTile(
                        letter: String.fromCharCode(65 + i),
                        text: question.options[i],
                        selected: _selected == i,
                        onTap: () => setState(() => _selected = i),
                      ),
                    ),
                ],
              ),
            ),
            SageButton(
              variant: _selected == null ? SageButtonVariant.primary : SageButtonVariant.accent,
              fullWidth: true,
              onPressed: _selected == null ? null : next,
              child: Text(
                _index == _questions.length - 1 ? 'Finish Quiz' : 'Next Question',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.letter,
    required this.text,
    required this.selected,
    required this.onTap,
  });

  final String letter;
  final String text;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? StudentColors.primaryContainer : StudentColors.surfaceLowest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? StudentColors.primary : StudentColors.outlineVariant,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: selected ? StudentColors.primary : StudentColors.surfaceContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                letter,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: selected ? Colors.white : StudentColors.primary,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle, size: 20, color: StudentColors.primary),
          ],
        ),
      ),
    );
  }
}
