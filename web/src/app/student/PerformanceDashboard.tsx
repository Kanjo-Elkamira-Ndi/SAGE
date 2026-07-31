import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Trophy,
  Target,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { TabNav } from "@/components/ui/TabNav";
import { ProgressBar } from "@/components/ui/ProgressBar";

const performanceStats = [
  {
    icon: Trophy,
    label: "Overall Average",
    value: "87%",
    description: "↑ 3% from last term",
    iconClassName: "bg-purple-100 text-purple-600",
  },
  {
    icon: Target,
    label: "Assignments",
    value: "91%",
    description: "12/12 submitted",
    iconClassName: "bg-blue-100 text-blue-600",
  },
  {
    icon: Activity,
    label: "Quizzes",
    value: "85%",
    description: "12 quizzes taken",
    iconClassName: "bg-green-100 text-green-600",
  },
  {
    icon: TrendingUp,
    label: "Attendance",
    value: "96%",
    description: "2 absences this term",
    iconClassName: "bg-amber-100 text-amber-600",
  },
];

const coursePerformance = [
  {
    course: "CS101 - Intro to CS",
    grade: "A-",
    score: 88,
    trend: "up",
    assignments: 95,
    quizzes: 90,
    exams: 82,
  },
  {
    course: "CS201 - Data Structures",
    grade: "B+",
    score: 82,
    trend: "up",
    assignments: 88,
    quizzes: 80,
    exams: 78,
  },
  {
    course: "MATH251 - Linear Algebra",
    grade: "A",
    score: 93,
    trend: "up",
    assignments: 96,
    quizzes: 91,
    exams: 92,
  },
  {
    course: "ENG102 - Academic Writing",
    grade: "B",
    score: 78,
    trend: "down",
    assignments: 82,
    quizzes: null,
    exams: 74,
  },
  {
    course: "PHYS101 - Physics I",
    grade: null,
    score: 65,
    trend: "up",
    assignments: 70,
    quizzes: 60,
    exams: null,
  },
];

const recentScores = [
  {
    title: "Week 7 Quiz: Searching & Sorting",
    score: 92,
    max: 100,
    date: "Mar 16, 2026",
    type: "quiz",
  },
  {
    title: "Assignment 1: Basic Programs",
    score: 92,
    max: 100,
    date: "Feb 8, 2026",
    type: "assignment",
  },
  {
    title: "Quiz 1: Variables & Data Types",
    score: 100,
    max: 100,
    date: "Jan 25, 2026",
    type: "quiz",
  },
  {
    title: "Midterm: Linear Algebra",
    score: 88,
    max: 100,
    date: "Mar 5, 2026",
    type: "exam",
  },
  {
    title: "Assignment: Linked List Implementation",
    score: 85,
    max: 100,
    date: "Mar 10, 2026",
    type: "assignment",
  },
];

export default function PerformanceDashboard() {
  const [view, setView] = useState("courses");

  return (
    <StudentLayout>
      <div className="space-y-6">
        <PageHeader
          title="Performance"
          description="Track your academic progress and grades"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <TabNav
          tabs={[
            { id: "courses", label: "Course Breakdown" },
            { id: "recent", label: "Recent Scores" },
          ]}
          activeTab={view}
          onTabChange={setView}
        />

        {view === "courses" && (
          <div className="space-y-3">
            {coursePerformance.map((cp) => (
              <Card key={cp.course} className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {cp.course}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {cp.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {cp.grade ? (
                      <Badge className="bg-accent/10 text-accent" variant="secondary">
                        {cp.grade}
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <ProgressBar value={cp.score} size="md" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {cp.assignments !== null && (
                    <div className="text-center">
                      <p className="text-xs text-text-secondary">Assignments</p>
                      <p className="text-lg font-bold text-text-primary">
                        {cp.assignments}%
                      </p>
                    </div>
                  )}
                  {cp.quizzes !== null && (
                    <div className="text-center">
                      <p className="text-xs text-text-secondary">Quizzes</p>
                      <p className="text-lg font-bold text-text-primary">
                        {cp.quizzes}%
                      </p>
                    </div>
                  )}
                  {cp.exams !== null && (
                    <div className="text-center">
                      <p className="text-xs text-text-secondary">Exams</p>
                      <p className="text-lg font-bold text-text-primary">
                        {cp.exams}%
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {view === "recent" && (
          <div className="space-y-3">
            {recentScores.map((item, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        item.type === "quiz"
                          ? "bg-green-100"
                          : item.type === "assignment"
                            ? "bg-blue-100"
                            : "bg-purple-100"
                      }`}
                    >
                      {item.type === "quiz" ? (
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      ) : item.type === "assignment" ? (
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Target className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {item.date} &middot;{" "}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-text-primary">
                      {Math.round((item.score / item.max) * 100)}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      {item.score}/{item.max}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (item.score / item.max) * 100 >= 90
                          ? "bg-green-500"
                          : (item.score / item.max) * 100 >= 70
                            ? "bg-accent"
                            : "bg-amber-500"
                      }`}
                      style={{
                        width: `${(item.score / item.max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
