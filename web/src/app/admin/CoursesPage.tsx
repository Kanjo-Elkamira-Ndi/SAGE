import { useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  UsersRound,
  CheckCircle2,
  Download,
  Plus,
  MoreVertical,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { PageHeader, StatCard } from "@/features/admin/components/ui";
import { StatusBadge } from "@/features/admin/components/badges";
import { courses, courseKpis, courseDepartments, reviewQueue, type Course } from "@/features/admin/data";

export default function CoursesPage() {
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [stateFilter, setStateFilter] = useState("All States");

  const filtered = useMemo(() => {
    return courses.filter(
      (c) =>
        (deptFilter === "All Departments" || c.department === deptFilter) &&
        (stateFilter === "All States" || c.status === stateFilter)
    );
  }, [deptFilter, stateFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Oversight"
        description="Manage and monitor academic offerings across all institution departments."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link to="/admin/courses/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Courses"
          value={courseKpis.totalCourses}
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ text: courseKpis.totalCoursesDelta, tone: "positive" }}
        />
        <StatCard
          label="Active Enrollment"
          value={courseKpis.activeEnrollment}
          icon={<Users className="h-5 w-5" />}
          trend={{ text: courseKpis.activeEnrollmentTag }}
          iconChipClass="bg-[#E8EEF7] text-[#4059AA]"
        />
        <StatCard
          label="Avg. Class Size"
          value={courseKpis.avgClassSize}
          icon={<UsersRound className="h-5 w-5" />}
        />
        <StatCard
          label="Completion Rate"
          value={courseKpis.completionRate}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={{ text: "On track", tone: "positive" }}
          iconChipClass="bg-green-50 text-success"
        />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-56"
          aria-label="Filter by department"
        >
          <option>All Departments</option>
          {courseDepartments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
        <Select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="w-44"
          aria-label="Filter by state"
        >
          <option>All States</option>
          <option>Active</option>
          <option>Registration</option>
          <option>Review</option>
          <option>Archived</option>
        </Select>
      </div>

      {/* Course table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c: Course) => {
              const fill = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0;
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                      {c.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-primary">{c.title}</p>
                    <p className="text-xs text-admin-text-muted">{c.tag}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-royal text-[10px] font-bold text-white">
                        {c.lecturerInitials}
                      </span>
                      <span className="text-sm text-text-primary">{c.lecturer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">
                    {c.department}
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <p className="text-sm font-medium text-text-primary">
                        {c.enrolled}/{c.capacity}
                      </p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-admin-container-high">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${fill}%`,
                            backgroundColor:
                              fill > 90 ? "#C0362C" : fill > 75 ? "#FFC641" : "#00236F",
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <button
                        aria-label={`Actions for ${c.title}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <p className="text-sm text-admin-text-muted">Rows per page:</p>
            <Select className="h-8 w-20 py-0 text-xs" defaultValue="10" aria-label="Rows per page">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </Select>
          </div>
          <p className="text-sm text-admin-text-muted">
            Showing 1-{filtered.length} of 1,248
          </p>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-text-primary">1</span>
            <button
              aria-label="Next page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Review queue */}
        <Card className="flex flex-col gap-4 border-admin-gold-soft bg-admin-gold-soft/40 p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-gold text-text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight">
                Institutional Review Pending
              </h4>
              <p className="text-xs font-medium text-admin-gold-dark">
                {reviewQueue.count} courses awaiting approval
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-admin-text-muted">
            {reviewQueue.note}
          </p>
          <div className="mt-auto flex gap-2.5">
            <Button size="sm" variant="secondary">
              Review Queue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Quick stats */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold tracking-tight">Quick Stats</h4>
            <TrendingUp className="h-4 w-4 text-admin-royal" />
          </div>
          <div className="space-y-4">
            {[
              { label: "Active Departments", value: "12" },
              { label: "Staff Members", value: "342" },
              { label: "Avg Grade Point", value: "3.41" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between border-b border-admin-outline/60 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-admin-text-muted">{s.label}</span>
                <span className="text-lg font-bold text-text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
