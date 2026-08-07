import { useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  UsersRound,
  Download,
  Plus,
  Pencil,
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
import { QueryBoundary } from "@/features/admin/components/states";
import { useAdminCourses } from "@/features/admin/queries";
import type { AdminCourse } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const PAGE_SIZE = 20;

function initials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [stateFilter, setStateFilter] = useState("All States");

  const { data, isLoading, error, refetch } = useAdminCourses({ page, limit: PAGE_SIZE });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter(
      (c) =>
        (deptFilter === "All Departments" || c.departmentName === deptFilter) &&
        (stateFilter === "All States" ||
          (stateFilter === "Active" ? c.isActive : !c.isActive))
    );
  }, [data, deptFilter, stateFilter]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const c of data?.items ?? []) if (c.departmentName) set.add(c.departmentName);
    return [...set].sort();
  }, [data]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const inView = data?.items ?? [];
  const totalEnrolled = inView.reduce((acc, c) => acc + c.enrolledCount, 0);
  const avgClassSize = inView.length
    ? (totalEnrolled / inView.length).toFixed(1)
    : "0";
  const activeCount = inView.filter((c) => c.isActive).length;

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
          value={total.toLocaleString()}
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ text: "All semesters", tone: "positive" }}
        />
        <StatCard
          label="Enrolled (in view)"
          value={totalEnrolled.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          trend={{ text: "Current page" }}
          iconChipClass="bg-[#E8EEF7] text-[#4059AA]"
        />
        <StatCard
          label="Avg. Class Size"
          value={avgClassSize}
          icon={<UsersRound className="h-5 w-5" />}
        />
        <StatCard
          label="Active Courses"
          value={activeCount.toLocaleString()}
          icon={<Pencil className="h-5 w-5" />}
          trend={{ text: "In view", tone: "positive" }}
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
          {departments.map((d) => (
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
          <option>Inactive</option>
        </Select>
      </div>

      {/* Course table */}
      <Card className="overflow-hidden">
        <QueryBoundary
          isLoading={isLoading}
          error={error}
          errorText={sageErrorText(error, "Failed to load courses.")}
          onRetry={() => refetch()}
        >
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
              {filtered.map((c: AdminCourse) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                      {c.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-primary">{c.title}</p>
                    <p className="text-xs text-admin-text-muted">
                      {c.semester ?? "No semester"} · {c.creditUnits ?? "—"} units
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-royal text-[10px] font-bold text-white">
                        {initials(c.lecturerName)}
                      </span>
                      <span className="text-sm text-text-primary">{c.lecturerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">
                    {c.departmentName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <p className="text-sm font-medium text-text-primary">
                        {c.enrolledCount}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Link
                        to={`/admin/courses/${c.id}`}
                        aria-label={`Edit ${c.title}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-admin-text-muted">
                    No courses match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </QueryBoundary>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">
            Page {page} of {totalPages} · {total.toLocaleString()} results
          </p>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-text-primary">{page}</span>
            <button
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Institutional overview */}
        <Card className="flex flex-col gap-4 border-admin-gold-soft bg-admin-gold-soft/40 p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-gold text-text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight">
                Institutional Overview
              </h4>
              <p className="text-xs font-medium text-admin-gold-dark">
                {activeCount} of {inView.length} courses active in view
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-admin-text-muted">
            Academic offerings across all departments. Use filters to scope the
            catalog, and open a course to edit its details.
          </p>
          <div className="mt-auto flex gap-2.5">
            <Link to="/admin/courses/new">
              <Button size="sm" variant="secondary">
                Create Course
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
              { label: "Active Courses", value: activeCount.toLocaleString() },
              { label: "Total Enrollment", value: totalEnrolled.toLocaleString() },
              { label: "Avg Grade Point", value: "—" },
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
