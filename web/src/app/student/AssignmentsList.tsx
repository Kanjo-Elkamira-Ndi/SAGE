import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const assignments = [
  {
    id: "1",
    title: "Assignment 1: Basic Programs",
    course: "CS101 - Intro to CS",
    dueDate: "Feb 8, 2026",
    submitted: "Feb 7, 2026",
    status: "graded",
    grade: "92/100",
    feedback: "Excellent work!",
  },
  {
    id: "2",
    title: "Assignment 2: Algorithm Implementation",
    course: "CS101 - Intro to CS",
    dueDate: "Mar 28, 2026",
    status: "pending",
    description: "Implement sorting algorithms and compare performance.",
  },
  {
    id: "3",
    title: "Problem Set 3: Matrix Operations",
    course: "MATH251 - Linear Algebra",
    dueDate: "Mar 30, 2026",
    status: "draft",
    description: "Solve problems on matrix multiplication and inverses.",
  },
  {
    id: "4",
    title: "Assignment 1: Linked Lists",
    course: "CS201 - Data Structures",
    dueDate: "Mar 20, 2026",
    submitted: "Mar 19, 2026",
    status: "submitted",
  },
  {
    id: "5",
    title: "Essay: The Digital Divide",
    course: "ENG102 - Academic Writing",
    dueDate: "Apr 5, 2026",
    status: "pending",
    description: "Write a 1500-word essay on the digital divide.",
  },
  {
    id: "6",
    title: "Lab Report: Pendulum Experiment",
    course: "PHYS101 - Physics I",
    dueDate: "Apr 2, 2026",
    status: "draft",
    description: "Complete lab report for the pendulum experiment.",
  },
  {
    id: "7",
    title: "Assignment 2: Stacks & Queues",
    course: "CS201 - Data Structures",
    dueDate: "Apr 10, 2026",
    status: "not_started",
    description: "Implement stack and queue data structures.",
  },
];

const statusMeta: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  graded: {
    label: "Graded",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  submitted: {
    label: "Submitted",
    icon: Clock,
    className: "bg-blue-100 text-blue-700",
  },
  pending: {
    label: "Pending",
    icon: AlertCircle,
    className: "bg-amber-100 text-amber-700",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-gray-100 text-gray-700",
  },
  not_started: {
    label: "Not Started",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700",
  },
};

export default function AssignmentsList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.course.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && a.status === filter;
  });

  return (
    <StudentLayout>
      <div className="space-y-6">
        <PageHeader
          title="Assignments"
          description="Track and submit your assignments"
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "graded",
              "submitted",
              "pending",
              "draft",
              "not_started",
            ].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "not_started"
                    ? "Not Started"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((assignment) => {
            const meta =
              statusMeta[assignment.status] || statusMeta.not_started;
            const Icon = meta.icon;

            return (
              <Link key={assignment.id} to={`/student/assignments/${assignment.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/30 cursor-pointer">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.className}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">
                      {assignment.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span>{assignment.course}</span>
                      <span>Due: {assignment.dueDate}</span>
                      {assignment.submitted && (
                        <span>Submitted: {assignment.submitted}</span>
                      )}
                      {assignment.grade && (
                        <span className="font-medium text-accent">
                          {assignment.grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={meta.className} variant="secondary">
                      {meta.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}
