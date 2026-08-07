import { Link } from "react-router-dom";
import {
  CalendarDays,
  Download,
  FileText,
  PieChart,
  TriangleAlert,
  TrendingUp,
  Users,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Megaphone,
  UserRoundCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { PageHeader } from "@/features/admin/components/ui";
import { DonutChart } from "@/components/ui/Chart";
import { QueryBoundary } from "@/features/admin/components/states";
import {
  useAtRiskReport,
  useDashboardStats,
  useExportAtRisk,
} from "@/features/admin/queries";
import { sageErrorText } from "@/lib/queryClient";

function compact(n: number): string {
  return n.toLocaleString();
}

export default function ReportsPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: statsRefetch,
  } = useDashboardStats();
  const { data: atRisk } = useAtRiskReport({});
  const exportCsv = useExportAtRisk();

  const byLevel = stats?.atRisk.byLevel ?? { low: 0, medium: 0, high: 0 };
  const riskCount = atRisk?.items.length ?? 0;
  const riskRate =
    stats && stats.totalStudents > 0
      ? Math.round((riskCount / stats.totalStudents) * 100)
      : 0;

  const atRiskDonut = [
    { label: "High", value: byLevel.high, color: "#C0362C" },
    { label: "Medium", value: byLevel.medium, color: "#FFC641" },
    { label: "Low", value: byLevel.low, color: "#00236F" },
  ];

  const reports = [
    {
      name: "At-Risk Students Report",
      type: "Risk",
      generatedBy: "Academic Precision",
      to: "/admin/reports/at-risk",
      download: true,
    },
    {
      name: "Activity Logs",
      type: "Audit",
      generatedBy: "SAGE Core",
      to: "/admin/activity",
      download: false,
    },
    {
      name: "Course Catalog",
      type: "Curriculum",
      generatedBy: "Registrar",
      to: "/admin/courses",
      download: false,
    },
    {
      name: "Department Overview",
      type: "Organization",
      generatedBy: "Institutional Registry",
      to: "/admin/departments",
      download: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Overview"
        description="Comprehensive analytical insights from live SAGE data."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <CalendarDays className="h-4 w-4" />
              Live Data
            </Button>
            <Link to="/admin/reports/at-risk">
              <Button size="sm">
                <TriangleAlert className="h-4 w-4" />
                At-Risk Report
              </Button>
            </Link>
          </>
        }
      />

      <QueryBoundary
        isLoading={statsLoading}
        error={statsError}
        errorText={sageErrorText(statsError, "Failed to load report metrics.")}
        onRetry={() => statsRefetch()}
      >
        {stats && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Enrollment summary */}
            <Card className="flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold tracking-tight">
                    Enrollment Summary
                  </h4>
                  <p className="mt-0.5 text-xs text-admin-text-muted">
                    Active enrollments across the institution
                  </p>
                </div>
                <button
                  aria-label="Export CSV"
                  className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <p className="text-3xl font-bold tracking-tight text-text-primary">
                {compact(stats.totalEnrollments)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-success">
                <TrendingUp className="h-4 w-4" />
                {compact(stats.totalStudents)} students
              </p>
              <Link
                to="/admin/users"
                className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-admin-royal transition-colors hover:text-admin-royal-hover"
              >
                View Breakdown
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            {/* At-risk distribution */}
            <Card className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold tracking-tight">
                    At-Risk Distribution
                  </h4>
                  <p className="mt-0.5 text-xs text-admin-text-muted">
                    Students by risk level
                  </p>
                </div>
                <button
                  aria-label="Export PDF"
                  className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <DonutChart
                  data={atRiskDonut}
                  size={130}
                  thickness={16}
                  centerLabel={compact(riskCount)}
                  centerSub="at risk"
                />
                <div className="flex-1 space-y-2.5">
                  {atRiskDonut.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-admin-text-muted">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.label}
                      </span>
                      <span className="font-semibold text-text-primary">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/admin/reports/at-risk"
                className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-admin-royal transition-colors hover:text-admin-royal-hover"
              >
                View At-Risk List
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            {/* At-risk summary */}
            <Card className="flex flex-col border-admin-gold-soft bg-admin-gold-soft/40 p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                    <TriangleAlert className="h-4 w-4 text-admin-gold-dark" />
                    At-Risk Summary
                  </h4>
                  <p className="mt-0.5 text-xs font-medium text-admin-gold-dark">
                    Intervention flags based on engagement
                  </p>
                </div>
                <button
                  aria-label="Export CSV"
                  disabled={exportCsv.isPending}
                  onClick={() => exportCsv.mutate({})}
                  className="rounded-lg border border-admin-outline bg-white p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <p className="text-3xl font-bold tracking-tight text-text-primary">
                {riskRate}%
                <span className="ml-1 text-sm font-medium text-admin-text-muted">
                  risk rate
                </span>
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm text-admin-text-muted">High Risk</span>
                  <span className="font-bold text-text-primary">
                    {byLevel.high} Students
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm text-admin-text-muted">Medium Risk</span>
                  <span className="font-bold text-text-primary">
                    {byLevel.medium} Students
                  </span>
                </div>
              </div>
              <Link
                to="/admin/reports/at-risk"
                className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-admin-royal transition-colors hover:text-admin-royal-hover"
              >
                View At-Risk List
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Card>

            {/* System metrics */}
            <Card className="flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold tracking-tight">
                    System Metrics
                  </h4>
                  <p className="mt-0.5 text-xs text-admin-text-muted">
                    Institution operational counts
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
                  <UserRoundCheck className="h-4 w-4 text-admin-royal" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Pending Lecturers</p>
                    <p className="text-sm font-bold text-text-primary">
                      {compact(stats.pendingLecturers)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
                  <Megaphone className="h-4 w-4 text-admin-royal" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Announcements</p>
                    <p className="text-sm font-bold text-text-primary">
                      {compact(stats.announcements)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
                  <Users className="h-4 w-4 text-admin-royal" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Active Courses</p>
                    <p className="text-sm font-bold text-text-primary">
                      {compact(stats.activeCourses)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
                  <Clock3 className="h-4 w-4 text-admin-royal" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Lecturers</p>
                    <p className="text-sm font-bold text-text-primary">
                      {compact(stats.totalLecturers)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}
      </QueryBoundary>

      {/* Available reports */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold tracking-tight">Available Reports</h4>
          <span className="text-sm font-medium text-admin-royal">
            {reports.length} reports
          </span>
        </div>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <Link
                        to={r.to}
                        className="font-medium text-text-primary transition-colors hover:text-admin-royal"
                      >
                        {r.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-admin-container-low px-2.5 py-0.5 text-xs font-semibold text-admin-text-muted">
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">
                    {r.generatedBy}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      {r.download && (
                        <button
                          aria-label={`Download ${r.name}`}
                          disabled={exportCsv.isPending}
                          onClick={() => exportCsv.mutate({})}
                          className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        to={r.to}
                        aria-label={`Open ${r.name}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
