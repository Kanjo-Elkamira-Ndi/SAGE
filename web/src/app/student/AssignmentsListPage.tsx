import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PageTransition } from "@/components/layout/PageTransition";

const assignments = [
  {
    course: "Macroeconomics II",
    title: "Quarterly Market Analysis",
    deadline: "Oct 24",
    status: "NOT SUBMITTED" as const,
  },
  {
    course: "Distributed Systems",
    title: "Concurrency Control",
    deadline: "Oct 27",
    status: "SUBMITTED" as const,
  },
  {
    course: "Quantum Mechanics",
    title: "Schrödinger Problem Set",
    deadline: "Nov 02",
    status: "Graded" as const,
  },
  {
    course: "Renaissance History",
    title: "Florence Cathedral",
    deadline: "Nov 05",
    status: "SUBMITTED" as const,
  },
  {
    course: "Number Theory",
    title: "Primality Testing",
    deadline: "Nov 12",
    status: "Graded" as const,
  },
];

const statusStyles: Record<string, { variant: "danger" | "success" | "accent"; label: string }> = {
  "NOT SUBMITTED": { variant: "danger", label: "NOT SUBMITTED" },
  SUBMITTED: { variant: "success", label: "SUBMITTED" },
  Graded: { variant: "accent", label: "Graded" },
};

export default function AssignmentsListPage() {
  return (
    <PageTransition>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-gutter)] py-8">
        <PageHeader
          title="Assignment Repository"
          description="View and manage all course requirements"
        />

        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-body-sm text-text-primary hover:bg-surface transition-colors">
              All Courses
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
          <Button variant="ghost" size="sm" className="border border-border">
            <Calendar className="h-4 w-4" />
            This Week
          </Button>
          <Button variant="ghost" size="sm" className="border border-border">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="PENDING" value="04" icon={AlertCircle} />
          <StatCard label="DUE THIS WEEK" value="02" icon={Clock} />
          <StatCard label="SUBMITTED" value="12" icon={CheckCircle} />
          <StatCard label="AVG. GRADE" value="94%" icon={TrendingUp} trend={{ value: "+2.5%", positive: true }} />
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Assignment Title
                      </th>
                      <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="text-left px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-label-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => {
                      const statusInfo = statusStyles[a.status];
                      return (
                        <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                          <td className="px-6 py-4 text-body-sm text-text-primary font-medium">
                            {a.course}
                          </td>
                          <td className="px-6 py-4 text-body-sm text-text-primary">
                            {a.title}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                              <Calendar className="h-4 w-4" />
                              {a.deadline}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-primary-subtle hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-label-sm text-text-secondary">Page 1 of 5</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="ghost" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <aside className="w-80 shrink-0 space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-body-sm font-semibold text-text-primary">Featured Resource</h3>
                  <p className="text-label-sm text-text-secondary">Library Access</p>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary mb-3">
                Access the digital library with thousands of academic papers, journals, and reference
                materials.
                <button className="text-primary font-medium ml-1 hover:underline">Browse</button>
              </p>
              <div className="flex items-center justify-between text-label-sm text-text-secondary">
                <span>Updated weekly</span>
                <Download className="h-4 w-4" />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-body-sm font-semibold text-text-primary mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">Career Fair</p>
                    <p className="text-label-sm text-text-secondary">Oct 28 · 10:00 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">Thesis Seminar</p>
                    <p className="text-label-sm text-text-secondary">Nov 04 · 2:00 PM</p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <footer className="mt-10 pt-6 border-t border-border">
          <div className="flex items-center gap-6">
            <button className="text-label-sm text-text-secondary hover:text-text-primary transition-colors">
              System Status
            </button>
            <button className="text-label-sm text-text-secondary hover:text-text-primary transition-colors">
              Privacy Policy
            </button>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
