import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const questions = [
  {
    id: "q1",
    question:
      "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
  },
  {
    id: "q2",
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correct: 1,
  },
  {
    id: "q3",
    question: "What is a correct way to declare a variable in Python?",
    options: [
      "int x = 5",
      "x = 5",
      "var x = 5",
      "let x = 5",
    ],
    correct: 1,
  },
  {
    id: "q4",
    question:
      "Which of the following is NOT a primitive data type in Java?",
    options: ["int", "boolean", "String", "char"],
    correct: 2,
  },
  {
    id: "q5",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Core Processing Unit",
    ],
    correct: 0,
  },
];

export default function QuizInProgress() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const current = questions[currentIndex];

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate(`/student/quizzes/${quizId}/results`, {
        state: { answers, total: questions.length },
      });
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizId, navigate, answers]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < questions.length) setCurrentIndex(index);
  };

  const answeredCount = Object.keys(answers).length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    navigate(`/student/quizzes/${quizId}/results`, {
      state: { answers, total: questions.length },
    });
  };

  return (
    <StudentLayout>
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary">
              Week 8 Quiz: OOP Concepts
            </h1>
            <Badge
              variant="secondary"
              className={`${
                timeLeft < 300
                  ? "bg-red-100 text-red-700 animate-pulse"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <Clock className="mr-1 h-4 w-4" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
          <Button onClick={handleSubmit}>
            Submit Quiz
          </Button>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFlag}
                  className={
                    flagged.has(current.id) ? "text-accent" : "text-text-muted"
                  }
                >
                  <Flag className="mr-1 h-4 w-4" />
                  {flagged.has(current.id) ? "Flagged" : "Flag for review"}
                </Button>
              </div>

              <h2 className="mb-6 text-lg font-medium text-text-primary">
                {current.question}
              </h2>

              <div className="space-y-3">
                {current.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      answers[current.id] === i
                        ? "border-primary bg-primary-subtle"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          answers[current.id] === i
                            ? "bg-primary text-white"
                            : "bg-surface text-text-secondary"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-text-primary">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                {answeredCount} of {questions.length} answered
              </span>
              <Button
                variant="outline"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isFlagged = flagged.has(q.id);
                  const isAnswered = answers[q.id] !== undefined;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(i)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        i === currentIndex
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      } ${
                        isAnswered
                          ? "bg-primary text-white"
                          : isFlagged
                            ? "bg-amber-100 text-amber-700"
                            : "bg-surface text-text-secondary hover:bg-border"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="h-3 w-3 rounded bg-primary" />
                  Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="h-3 w-3 rounded bg-amber-100 border border-amber-300" />
                  Flagged
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="h-3 w-3 rounded bg-surface border border-border" />
                  Unanswered
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
