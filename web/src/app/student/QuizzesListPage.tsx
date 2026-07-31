import {
  Clock,
  Calendar,
  ChevronRight,
  Download,
  Play,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PageTransition } from "@/components/layout/PageTransition";

const quizzes = [
  {
    code: "CS-402",
    title: "Advanced Algorithms",
    status: "Not Started",
    timing: "60min",
    period: "Ends Oct 25",
    action: "Start Quiz",
    variant: "primary" as const,
  },
  {
    code: "PHY-101",
    title: "Quantum Mechanics Intro",
    status: "In Progress",
    timing: "active session",
    period: null,
    action: "Resume Quiz",
    variant: "accent" as const,
  },
  {
    code: "MATH-202",
    title: "Discrete Mathematics",
    status: "Completed",
    timing: "92/100",
    period: null,
    action: "View Results",
    variant: "secondary" as const,
  },
  {
    code: "BIO-305",
    title: "Molecular Biology Finals",
    status: "Not Started",
    timing: "120min",
    period: "Oct 28-Nov 01",
    action: "Take Examination",
    variant: "primary" as const,
  },
];

const completed = [
  { title: "Linear Algebra Quiz 3", course: "MATH-202", date: "Oct 15, 2023", score: "92/100" },
  { title: "Organic Chemistry Midterm", course: "CHEM-101", date: "Oct 10, 2023", score: "88/100" },
];

const statusBadge: Record<string, "default" | "warning" | "success"> = {
  "Not Started": "default",
  "In Progress": "warning",
  Completed: "success",
};

export default function QuizzesListPage() {
  return (
    <PageTransition>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-gutter)] py-8">
        <PageHeader
          title="Examination Dashboard"
          description="Fall Semester 2024"
        />

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Available" value="04" icon={FileText} />
          <StatCard label="In Progress" value="01" icon={RefreshCw} />
          <StatCard label="Completed" value="12" icon={CheckCircle} />
          <StatCard label="Missed" value="00" icon={AlertCircle} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {quizzes.map((q, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-label-sm text-text-secondary">{q.code}</span>
                  <h3 className="text-body-md font-semibold text-text-primary mt-0.5">{q.title}</h3>
                </div>
                <Badge variant={statusBadge[q.status] || "default"}>{q.status}</Badge>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  {q.timing}
                </span>
                {(q.status === "Not Started" && q.period) && (
                  <span className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary">
                    <Calendar className="h-3.5 w-3.5" />
                    {q.period}
                  </span>
                )}
              </div>
              {q.status === "Completed" ? (
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Eye className="h-4 w-4" />
                  {q.action}
                </Button>
              ) : (
                <Button variant={q.variant} size="sm" className="gap-1.5">
                  <Play className="h-4 w-4" />
                  {q.action}
                </Button>
              )}
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-right px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {completed.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-medium text-text-primary">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">{c.course}</td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">{c.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-body-sm font-semibold text-success">{c.score}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
