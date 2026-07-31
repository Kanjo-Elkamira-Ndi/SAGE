import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronRight,
  Trophy,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const quizzes = [
  {
    id: "1",
    title: "Week 4 Quiz: Functions & Modular Programming",
    course: "CS101 - Intro to CS",
    dueDate: "Feb 12, 2026",
    duration: "30 min",
    questions: 15,
    status: "completed",
    score: "14/15",
    percentage: 93,
  },
  {
    id: "2",
    title: "Week 7 Quiz: Searching & Sorting",
    course: "CS101 - Intro to CS",
    dueDate: "Mar 16, 2026",
    duration: "30 min",
    questions: 12,
    status: "completed",
    score: "11/12",
    percentage: 92,
  },
  {
    id: "3",
    title: "Week 8 Quiz: OOP Concepts",
    course: "CS101 - Intro to CS",
    dueDate: "Mar 30, 2026",
    duration: "30 min",
    questions: 15,
    status: "open",
    attempts: 2,
    maxAttempts: 3,
  },
  {
    id: "4",
    title: "Quiz 2: Matrix Operations",
    course: "MATH251 - Linear Algebra",
    dueDate: "Mar 25, 2026",
    duration: "45 min",
    questions: 10,
    status: "open",
    attempts: 1,
    maxAttempts: 3,
  },
  {
    id: "5",
    title: "Quiz 1: Variables & Data Types",
    course: "CS101 - Intro to CS",
    dueDate: "Jan 25, 2026",
    duration: "30 min",
    questions: 10,
    status: "completed",
    score: "10/10",
    percentage: 100,
  },
  {
    id: "6",
    title: "Quiz: Linked Lists Basics",
    course: "CS201 - Data Structures",
    dueDate: "Apr 5, 2026",
    duration: "45 min",
    questions: 12,
    status: "locked",
  },
];

const statusMeta: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  open: {
    label: "Available",
    icon: AlertCircle,
    className: "bg-blue-100 text-blue-700",
  },
  locked: {
    label: "Locked",
    icon: AlertCircle,
    className: "bg-gray-100 text-gray-700",
  },
};

export default function QuizzesList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = quizzes.filter((q) => {
    const matchesSearch = q.title
      .toLowerCase()
      .includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && q.status === filter;
  });

  return (
    <StudentLayout>
      <div className="space-y-6">
        <PageHeader
          title="Quizzes"
          description="Test your knowledge with course quizzes"
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "open", "completed", "locked"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "open"
                    ? "Available"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quiz) => {
            const meta = statusMeta[quiz.status] || statusMeta.locked;
            const Icon = meta.icon;

            return (
              <Card
                key={quiz.id}
                className={`p-5 transition-colors ${
                  quiz.status === "locked"
                    ? "opacity-60"
                    : "cursor-pointer hover:border-primary/30"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.className}`}
                  >
                    <Brain className="h-5 w-5" />
                  </div>
                  <Badge className={meta.className} variant="secondary">
                    {meta.label}
                  </Badge>
                </div>
                <h3 className="mb-1 font-semibold text-text-primary">
                  {quiz.title}
                </h3>
                <p className="text-xs text-text-secondary">{quiz.course}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {quiz.duration}
                  </span>
                  <span>{quiz.questions} questions</span>
                  {quiz.attempts && (
                    <span>
                      {quiz.attempts}/{quiz.maxAttempts} attempts
                    </span>
                  )}
                </div>

                {quiz.status === "completed" && quiz.percentage !== undefined && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Score</span>
                      <span className="font-medium text-text-primary">
                        {quiz.score} ({quiz.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quiz.percentage >= 90
                            ? "bg-green-500"
                            : quiz.percentage >= 70
                              ? "bg-accent"
                              : "bg-amber-500"
                        }`}
                        style={{ width: `${quiz.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  {quiz.status === "open" ? (
                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/student/quizzes/${quiz.id}`}>
                        Start Quiz
                      </Link>
                    </Button>
                  ) : quiz.status === "completed" ? (
                    <Button variant="outline" className="w-full" size="sm" asChild>
                      <Link to={`/student/quizzes/${quiz.id}/results`}>
                        <Trophy className="mr-1 h-4 w-4" />
                        View Results
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" disabled>
                      Locked
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}
