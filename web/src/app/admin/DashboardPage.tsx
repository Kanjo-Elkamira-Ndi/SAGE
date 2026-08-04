import {
  Users,
  UserRoundCheck,
  GraduationCap,
  TriangleAlert,
  CalendarDays,
  Download,
  UserPlus,
  BookOpenPlus,
  CircleAlert,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader, StatCard } from "../components/ui";
import { ProgressBar, LineChart } from "@/components/ui/Chart";
import {
  dashboardStats,
  retentionData,
  recentActivity,
  departmentHealth,
  type ActivityItem,
} from "../data";

const activityIcon = {
  person_add: UserPlus,
  library_add: BookOpenPlus,
  report: CircleAlert,
  campaign: Megaphone,
  shield: ShieldCheck,
} as const;

const quickLinks = [
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "System Reports", href: "/admin/reports", icon: ArrowUpRight },
  { label: "Activity Logs", href: "/admin/activity", icon: ArrowUpRight },
];

function ActivityFeed() {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between border-b border-admin-outline px-5 py-4">
        <h4 className="text-base font-semibold tracking-tight">Recent Activity</h4>
        <span className="rounded-full bg-admin-container-low px-2.5 py-1 text-xs font-medium text-admin-text-muted">
          Live
        </span>
      </div>
      <div className="flex-1 divide-y divide-admin-outline/70">
        {recentActivity.map((item: ActivityItem, i) => {
          const Icon = activityIcon[item.icon];
          return (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {item.text}
                </p>
              </div>
              <span className="shrink-0 text-xs text-admin-text-muted">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const lineSeries = [
    { name: "Undergraduate", color: "#00236F", values: retentionData.undergraduate },
    { name: "Graduate", color: "#FFC641", values: retentionData.graduate },
  ];

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

      {/* KPI stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={dashboardStats.totalStudents}
          icon={<Users className="h-5 w-5" />}
          trend={{ text: dashboardStats.totalStudentsTrend, tone: "positive" }}
        />
        <StatCard
          label="Total Lecturers"
          value={dashboardStats.totalLecturers}
          icon={<UserRoundCheck className="h-5 w-5" />}
          trend={{ text: dashboardStats.totalLecturersTrend }}
          iconChipClass="bg-admin-container-high text-admin-text-muted"
        />
        <StatCard
          label="Active Courses"
          value={dashboardStats.activeCourses}
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ text: dashboardStats.activeCoursesTrend, tone: "positive" }}
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
              {dashboardStats.atRiskCount}
            </p>
          </div>
        </Card>
      </section>

      {/* Bento content */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Retention chart */}
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-semibold tracking-tight">
                Student Retention Trend
              </h4>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-admin-text-muted">
                  <span className="h-2 w-2 rounded-full bg-admin-royal" />
                  Undergraduate
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-admin-text-muted">
                  <span className="h-2 w-2 rounded-full bg-admin-gold" />
                  Graduate
                </span>
              </div>
            </div>
            <LineChart
              labels={retentionData.labels}
              series={lineSeries}
              yMax={100}
              height={240}
            />
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
              {quickLinks.map(({ label, href, icon: Icon }) => (
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

          {/* Department health */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold tracking-tight">
                Department Health
              </h4>
              <span className="text-xs font-medium text-admin-text-muted">
                Score
              </span>
            </div>
            <div className="space-y-4">
              {departmentHealth.map((d) => (
                <div key={d.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">
                      {d.name}
                    </span>
                    <span
                      className={
                        d.score < 60
                          ? "font-semibold text-danger"
                          : "font-semibold text-text-primary"
                      }
                    >
                      {d.score}%
                    </span>
                  </div>
                  <ProgressBar
                    value={d.score}
                    color={d.score < 60 ? "#C0362C" : d.score < 75 ? "#FFC641" : "#00236F"}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

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
