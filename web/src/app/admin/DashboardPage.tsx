import {
  Users,
  UserRoundCheck,
  GraduationCap,
  TriangleAlert,
  CalendarDays,
  Download,
  UserPlus,
  BookOpen,
  CircleAlert,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader, StatCard } from "@/features/admin/components/ui";
import { ProgressBar, LineChart } from "@/components/ui/Chart";
import { useDashboardStats } from "@/features/admin/queries";
import { sageErrorText } from "@/lib/queryClient";
import { QueryBoundary } from "@/features/admin/components/states";

function compact(n: number): string {
  return n.toLocaleString();
}

function humanizeAction(action: string): string {
  const text = action.replace(/_/g, " ").trim();
  if (!text) return "System event";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const activityIcon = {
  user: UserPlus,
  course: BookOpen,
  at_risk: CircleAlert,
  announcement: Megaphone,
  permission: ShieldCheck,
  default: CircleAlert,
} as const;

function iconFor(entityType: string | null, action: string) {
  const key = action.includes("user_")
    ? "user"
    : entityType === "course"
      ? "course"
      : entityType === "announcement"
        ? "announcement"
        : action.includes("permission")
          ? "permission"
          : "default";
  return activityIcon[key];
}

function ActivityFeed() {
  const { data } = useDashboardStats();
  const items = data?.recentActivity ?? [];
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between border-b border-admin-outline px-5 py-4">
        <h4 className="text-base font-semibold tracking-tight">Recent Activity</h4>
        <span className="rounded-full bg-admin-container-low px-2.5 py-1 text-xs font-medium text-admin-text-muted">
          Live
        </span>
      </div>
      <div className="flex-1 divide-y divide-admin-outline/70">
        {items.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-admin-text-muted">
            No activity recorded yet.
          </p>
        )}
        {items.map((item) => {
          const Icon = iconFor(item.entityType, item.action);
          return (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {item.userName ? `${item.userName} — ` : ""}
                  {humanizeAction(item.action)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-admin-text-muted">
                {timeAgo(item.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AtRiskBreakdown() {
  const { data } = useDashboardStats();
  const byLevel = data?.atRisk.byLevel ?? { low: 0, medium: 0, high: 0 };
  const total = byLevel.low + byLevel.medium + byLevel.high;
  const rows = [
    { key: "high" as const, label: "High Risk", value: byLevel.high, color: "#C0362C" },
    { key: "medium" as const, label: "Medium Risk", value: byLevel.medium, color: "#FFC641" },
    { key: "low" as const, label: "Low Risk", value: byLevel.low, color: "#00236F" },
  ];
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold tracking-tight">At-Risk Breakdown</h4>
        <span className="text-xs font-medium text-admin-text-muted">Students</span>
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">{r.label}</span>
              <span
                className={
                  r.key === "high"
                    ? "font-semibold text-danger"
                    : "font-semibold text-text-primary"
                }
              >
                {r.value}
              </span>
            </div>
            <ProgressBar
              value={total ? Math.round((r.value / total) * 100) : 0}
              color={r.color}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Overview"
        description="Real-time metrics for SAGE institution governance."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <CalendarDays className="h-4 w-4" />
              Last 30 Days
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        errorText={sageErrorText(error, "Failed to load dashboard metrics.")}
        onRetry={() => refetch()}
      >
        {data && (
          <>
            {/* KPI stat cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Students"
                value={compact(data.totalStudents)}
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Total Lecturers"
                value={compact(data.totalLecturers)}
                icon={<UserRoundCheck className="h-5 w-5" />}
                iconChipClass="bg-admin-container-high text-admin-text-muted"
              />
              <StatCard
                label="Active Courses"
                value={compact(data.activeCourses)}
                icon={<GraduationCap className="h-5 w-5" />}
              />
              {/* At-risk — gold emphasis card */}
              <Card className="flex flex-col justify-between border-admin-gold-soft bg-admin-gold-soft/40 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-gold text-text-primary">
                    <TriangleAlert className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-admin-gold-dark">
                    Action Needed
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-admin-gold-dark">
                    At-Risk Count
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-text-primary">
                    {compact(data.atRisk.count)}
                  </p>
                </div>
              </Card>
            </section>

            {/* Bento content */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-8">
                {/* Enrollment trend */}
                <Card className="p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-base font-semibold tracking-tight">
                      Enrollment Trend (14 days)
                    </h4>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-admin-text-muted">
                      <span className="h-2 w-2 rounded-full bg-admin-royal" />
                      New enrollments
                    </span>
                  </div>
                  {data.retention.labels.length > 0 ? (
                    <LineChart
                      labels={data.retention.labels}
                      series={[
                        {
                          name: "Enrollments",
                          color: "#00236F",
                          values: data.retention.values,
                        },
                      ]}
                      yMax={Math.max(10, ...data.retention.values) * 1.2}
                      height={240}
                    />
                  ) : (
                    <p className="py-16 text-center text-sm text-admin-text-muted">
                      No enrollment activity in the last 14 days.
                    </p>
                  )}
                </Card>

                {/* Activity feed */}
                <ActivityFeed />
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6 lg:col-span-4">
                {/* Quick links */}
                <Card className="p-5">
                  <h4 className="mb-4 text-base font-semibold tracking-tight">
                    Quick Links
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Manage Users", href: "/admin/users", icon: Users },
                      { label: "System Reports", href: "/admin/reports", icon: ArrowUpRight },
                      { label: "Activity Logs", href: "/admin/activity", icon: ArrowUpRight },
                    ].map(({ label, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        className="group flex items-center justify-between rounded-lg border border-admin-outline px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-admin-royal hover:bg-admin-royal-soft/40"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-admin-royal" />
                          {label}
                        </span>
                        <ArrowRight className="h-4 w-4 text-admin-text-muted transition-transform group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </Card>

                {/* At-risk breakdown */}
                <AtRiskBreakdown />
              </div>
            </section>
          </>
        )}
      </QueryBoundary>

      <Card className="border-none bg-transparent p-0 shadow-none">
        <CardContent className="p-0 text-center">
          <p className="text-xs text-admin-text-muted">
            SAGE Global Connect — Managing the future of higher education through
            precision data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
