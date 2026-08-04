import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Download,
  FileText,
  PieChart,
  TriangleAlert,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  ArrowUpRight,
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
import { reportsKpis, gradeDistribution, recentReports } from "@/features/admin/data";

export default function ReportsPage() {
  const gradeColors = ["#00236F", "#FFC641", "#90A8FF", "#E3E2E8"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Overview"
        description="Comprehensive analytical insights for the 2023-2024 Academic Year."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <CalendarDays className="h-4 w-4" />
              Academic Year
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Enrollment summary */}
        <Card className="flex flex-col p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold tracking-tight">
                Enrollment Summary
              </h4>
              <p className="mt-0.5 text-xs text-admin-text-muted">
                Real-time tracking of new vs returning students
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                aria-label="Export CSV"
                className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                aria-label="Export PDF"
                className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
              >
                <FileText className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-text-primary">
            {reportsKpis.totalEnrollment}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-success">
            <TrendingUp className="h-4 w-4" />
            {reportsKpis.growthRate} growth
          </p>
          <Link
            to="/admin/reports"
            className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-admin-royal transition-colors hover:text-admin-royal-hover"
          >
            View Detailed Breakdown
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        {/* Grade distribution */}
        <Card className="flex flex-col p-5">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold tracking-tight">
                Grade Distribution
              </h4>
              <p className="mt-0.5 text-xs text-admin-text-muted">
                Global performance metrics
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
              data={gradeDistribution.map((g, i) => ({
                label: g.label,
                value: g.value,
                color: gradeColors[i],
              }))}
              size={130}
              thickness={16}
              centerLabel="1,248"
              centerSub="courses"
            />
            <div className="flex-1 space-y-2.5">
              {gradeDistribution.map((g, i) => (
                <div key={g.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-admin-text-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: gradeColors[i] }}
                    />
                    {g.label}
                  </span>
                  <span className="font-semibold text-text-primary">{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/admin/reports"
            className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-admin-royal transition-colors hover:text-admin-royal-hover"
          >
            Run Course Comparison
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
              className="rounded-lg border border-admin-outline bg-white p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <p className="text-3xl font-bold tracking-tight text-text-primary">
            15%
            <span className="ml-1 text-sm font-medium text-admin-text-muted">
              risk rate
            </span>
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
              <span className="text-sm text-admin-text-muted">Low Engagement</span>
              <span className="font-bold text-text-primary">342 Students</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
              <span className="text-sm text-admin-text-muted">Missed Deadlines</span>
              <span className="font-bold text-text-primary">128 Students</span>
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

        {/* System usage */}
        <Card className="flex flex-col p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold tracking-tight">System Usage</h4>
              <p className="mt-0.5 text-xs text-admin-text-muted">
                LMS and platform activity metrics
              </p>
            </div>
            <button
              aria-label="Download usage data"
              className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-1.5" aria-hidden="true">
            {[35, 55, 45, 80, 65, 92, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-admin-royal/30 transition-colors hover:bg-admin-royal" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-admin-text-muted">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
              <Users className="h-4 w-4 text-admin-royal" />
              <div>
                <p className="text-xs text-admin-text-muted">Peak Concurrent</p>
                <p className="text-sm font-bold text-text-primary">
                  {reportsKpis.peakConcurrent}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-admin-container-low p-3">
              <Clock className="h-4 w-4 text-admin-royal" />
              <div>
                <p className="text-xs text-admin-text-muted">Avg. Session</p>
                <p className="text-sm font-bold text-text-primary">
                  {reportsKpis.avgSession}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Recently generated reports */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold tracking-tight">
            Recently Generated Reports
          </h4>
          <span className="text-sm font-medium text-admin-royal">View all</span>
        </div>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <p className="font-medium text-text-primary">{r.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-admin-container-low px-2.5 py-0.5 text-xs font-semibold text-admin-text-muted">
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">{r.by}</TableCell>
                  <TableCell className="text-admin-text-muted">{r.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        aria-label={`Download ${r.name}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Share ${r.name}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
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
