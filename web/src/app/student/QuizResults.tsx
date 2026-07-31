import { useParams, useLocation, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  Trophy,
  RotateCcw,
  BarChart3,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

const questionsData = [
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

export default function QuizResults() {
  const { quizId } = useParams();
  const location = useLocation();
  const { answers = {}, total = questionsData.length } =
    (location.state as { answers: Record<string, number>; total: number }) ||
    {};

  let correctCount = 0;
  const results = questionsData.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect };
  });

  const percentage = Math.round((correctCount / total) * 100);

  const gradeInfo =
    percentage >= 90
      ? { label: "Excellent!", className: "text-green-600" }
      : percentage >= 70
        ? { label: "Good Job!", className: "text-accent" }
        : percentage >= 50
          ? { label: "Keep Practicing", className: "text-amber-600" }
          : { label: "Needs Improvement", className: "text-red-600" };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/student/quizzes">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>
        </div>

        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Trophy className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            {correctCount}/{total} Correct
          </h1>
          <p className={`mt-2 text-lg font-medium ${gradeInfo.className}`}>
            {gradeInfo.label}
          </p>
          <div className="mx-auto mt-4 flex max-w-xs items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage >= 90
                    ? "bg-green-500"
                    : percentage >= 70
                      ? "bg-accent"
                      : percentage >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-primary">
              {percentage}%
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/student/performance">
                <BarChart3 className="mr-1 h-4 w-4" />
                View Performance
              </Link>
            </Button>
            <Button asChild>
              <Link to="/student/quizzes">
                <RotateCcw className="mr-1 h-4 w-4" />
                Try Another Quiz
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Question Review
          </h2>
          <div className="space-y-4">
            {results.map((q, i) => (
              <div
                key={q.id}
                className={`rounded-lg border p-4 ${
                  q.isCorrect
                    ? "border-green-200 bg-green-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {q.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="mb-2 font-medium text-text-primary">
                      {i + 1}. {q.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      {q.options.map((opt, j) => {
                        const isUserChoice = q.userAnswer === j;
                        const isCorrectChoice = q.correct === j;
                        let className = "text-text-secondary";
                        if (isCorrectChoice)
                          className = "text-green-700 font-medium";
                        else if (isUserChoice && !q.isCorrect)
                          className = "text-red-700 font-medium";
                        return (
                          <p key={j} className={className}>
                            {String.fromCharCode(65 + j)}. {opt}
                            {isCorrectChoice && " ✓"}
                            {isUserChoice && !q.isCorrect && " (your answer)"}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
