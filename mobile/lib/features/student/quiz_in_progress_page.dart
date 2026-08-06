import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/sage_colors.dart';
import '../../data/models/api/quiz.dart';
import '../../shared/widgets/sage_button.dart';
import 'student_colors.dart';
import 'student_controller.dart';

/// Quiz attempt screen — question stepper with A–D options, countdown, and a
/// finishing flow that submits answers to the API (Stitch quiz screen).
/// Wired to `POST /quizzes/:id/start` and `POST /quizzes/:id/submit`.
class QuizInProgressPage extends ConsumerStatefulWidget {
  const QuizInProgressPage({super.key, required this.quizId});

  final String quizId;

  @override
  ConsumerState<QuizInProgressPage> createState() => _QuizInProgressPageState();
}

class _QuizInProgressPageState extends ConsumerState<QuizInProgressPage> {
  ApiQuizAttempt? _attempt;
  Object? _error;
  int _index = 0;
  int? _selected;
  List<String?> _answers = const [];
  Timer? _timer;
  int _secondsLeft = 0;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _startAttempt();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _startAttempt() async {
    setState(() {
      _attempt = null;
      _error = null;
    });
    try {
      final attempt = await ref
          .read(apiQuizRepositoryProvider)
          .start(widget.quizId);
      if (!mounted) return;
      setState(() {
        _attempt = attempt;
        _answers = List<String?>.filled(attempt.questions.length, null);
        _secondsLeft =
            (attempt.timeLimitMinutes ?? 0) > 0 ? attempt.timeLimitMinutes! * 60 : 0;
        _index = 0;
        _selected = null;
      });
      if (_secondsLeft > 0) _startTimer();
    } on Exception catch (error) {
      if (mounted) setState(() => _error = error);
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() => _secondsLeft -= 1);
      if (_secondsLeft <= 0) {
        timer.cancel();
        _submitAnswers();
      }
    });
  }

  String _timeLeftLabel() {
    final s = _secondsLeft < 0 ? 0 : _secondsLeft;
    final m = (s ~/ 60).toString().padLeft(2, '0');
    final sec = (s % 60).toString().padLeft(2, '0');
    return '$m:$sec';
  }

  Future<void> _submitAnswers() async {
    if (_submitting || _attempt == null) return;
    setState(() => _submitting = true);
    _timer?.cancel();
    final questions = _attempt!.questions;
    final answers = <Map<String, dynamic>>[
      for (var i = 0; i < questions.length; i++)
        if (_answers[i] != null)
          {'questionId': questions[i].id, 'answer': _answers[i]},
    ];
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref
          .read(apiQuizRepositoryProvider)
          .submit(widget.quizId, answers: answers);
      if (!mounted) return;
      context.go('/student/quiz-results/${widget.quizId}');
    } on Exception {
      messenger.showSnackBar(
        const SnackBar(content: Text('Could not submit the quiz. Try again.')),
      );
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _next() {
    final questions = _attempt!.questions;
    if (_selected == null) return;
    _answers[_index] = _selected! < questions[_index].options!.length
        ? questions[_index].options![_selected!]
        : '';
    if (_index == questions.length - 1) {
      _submitAnswers();
      return;
    }
    setState(() {
      _index += 1;
      _selected = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final attempt = _attempt;

    if (_error != null) {
      return Scaffold(
        backgroundColor: StudentColors.background,
        appBar: AppBar(
          backgroundColor: StudentColors.surfaceLowest,
          foregroundColor: StudentColors.primary,
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.cloud_off_outlined,
                  size: 40,
                  color: StudentColors.onSurfaceVariant,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Could not start the quiz',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: StudentColors.primary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Check your connection and try again.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: StudentColors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                SageButton(
                  onPressed: _startAttempt,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final questions = attempt?.questions ?? const <ApiAttemptQuestion>[];
    final quizTitle =
        ref.watch(apiQuizByIdProvider(widget.quizId)).value?.title;
    if (questions.isEmpty) {
      return Scaffold(
        backgroundColor: StudentColors.background,
        appBar: AppBar(
          backgroundColor: StudentColors.surfaceLowest,
          foregroundColor: StudentColors.primary,
          elevation: 0,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: StudentColors.primary),
        ),
      );
    }

    final question = questions[_index];
    final options = question.options ?? const <String>[];

    return Scaffold(
      backgroundColor: StudentColors.background,
      appBar: AppBar(
        backgroundColor: StudentColors.surfaceLowest,
        foregroundColor: StudentColors.primary,
        elevation: 0,
        title: Text(
          quizTitle ?? 'Quiz',
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
                      value: (_index + 1) / questions.length,
                      minHeight: 6,
                      backgroundColor: StudentColors.surfaceHighest,
                      valueColor:
                          const AlwaysStoppedAnimation(StudentColors.primary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${_index + 1}/${questions.length}',
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
                  Text(
                    _secondsLeft > 0
                        ? 'Time left: ${_timeLeftLabel()}'
                        : 'No time limit',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: StudentColors.primary,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    (attempt!.timeLimitMinutes ?? 0) > 0
                        ? '${attempt.timeLimitMinutes} min quiz'
                        : 'Untimed',
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
              question.questionText,
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
                  for (var i = 0; i < options.length; i++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _OptionTile(
                        letter: String.fromCharCode(65 + i),
                        text: options[i],
                        selected: _selected == i,
                        onTap: _submitting
                            ? null
                            : () => setState(() => _selected = i),
                      ),
                    ),
                ],
              ),
            ),
            SageButton(
              variant: _selected == null
                  ? SageButtonVariant.primary
                  : SageButtonVariant.accent,
              fullWidth: true,
              isLoading: _submitting,
              onPressed: _selected == null || _submitting ? null : _next,
              child: Text(
                _index == questions.length - 1 ? 'Finish Quiz' : 'Next Question',
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
  final VoidCallback? onTap;

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
