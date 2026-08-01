import 'package:flutter/material.dart';

import '../../app/theme/sage_colors.dart';
import 'student_colors.dart';
import 'student_scaffold.dart';

/// SAGE Assistant — conversational help with chat bubbles, online status, and
/// suggestion chips (Stitch sage-assistant screen).
class SageAssistantPage extends StatefulWidget {
  const SageAssistantPage({super.key});

  @override
  State<SageAssistantPage> createState() => _SageAssistantPageState();
}

class _SageAssistantPageState extends State<SageAssistantPage> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final List<({String text, bool fromUser})> _messages = [
    (text: 'Good morning, Alex! 👋 How can I help you today?', fromUser: false),
    (text: 'I can explain concepts, summarize notes, or suggest study plans.', fromUser: false),
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send(String text) {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add((text: text.trim(), fromUser: true));
      _messages.add(
        (text: 'Got it — I\u2019ll prepare a quick summary for that. '
            '(Demo reply: full AI integration arrives in a later phase.)',
            fromUser: false),
      );
    });
    _controller.clear();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return StudentPageScaffold(
      child: Column(
        children: [
          // Chat header
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
            color: StudentColors.surfaceLowest,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: StudentColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.school_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SAGE Assistant',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: StudentColors.primary,
                        ),
                      ),
                      Row(
                        children: [
                          Icon(
                            Icons.circle,
                            size: 8,
                            color: StudentColors.success,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Online',
                            style: TextStyle(
                              fontSize: 11,
                              color: StudentColors.success,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: StudentColors.outlineVariant),

          // Messages
          Expanded(
            child: ListView(
              controller: _scroll,
              padding: const EdgeInsets.all(20),
              children: [
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: StudentColors.surfaceHighest,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'TODAY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                        color: StudentColors.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                for (final message in _messages) ...[
                  _ChatBubble(text: message.text, fromUser: message.fromUser),
                  const SizedBox(height: 10),
                ],
              ],
            ),
          ),

          // Suggestion chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                for (final chip in [
                  'Summarize CS402 notes',
                  'Help with calculus',
                  'Explain Quiz 1',
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _SuggestionChip(
                      label: chip,
                      onTap: () => _send(chip),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Input bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            color: StudentColors.surfaceLowest,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.send,
                    onSubmitted: _send,
                    decoration: InputDecoration(
                      hintText: 'Ask anything\u2026',
                      filled: true,
                      fillColor: StudentColors.surfaceLow,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(999),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                IconButton.filled(
                  onPressed: () => _send(_controller.text),
                  style: IconButton.styleFrom(
                    backgroundColor: StudentColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.send, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.text, required this.fromUser});

  final String text;
  final bool fromUser;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: fromUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 300),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: fromUser
              ? StudentColors.surfaceContainer
              : StudentColors.primary,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(fromUser ? 14 : 4),
            bottomRight: Radius.circular(fromUser ? 4 : 14),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 13,
            height: 1.5,
            color: fromUser ? AppColors.textPrimary : Colors.white,
          ),
        ),
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  const _SuggestionChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: StudentColors.surfaceContainer,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.auto_awesome,
              size: 13,
              color: StudentColors.primary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: StudentColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
