import { TrendingUp, Warning, Draw, Stars, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageTransition } from "@/components/layout/PageTransition";

const courses = [
  { name: "Advanced Mathematics", percentage: 94, color: "bg-success" },
  { name: "Quantum Mechanics", percentage: 88, color: "bg-primary" },
  { name: "Systems Engineering", percentage: 92, color: "bg-success" },
  { name: "Advanced Thermodynamics", percentage: 74, color: "bg-warning" },
];

const feedbacks = [
  {
    icon: Draw,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    name: "Prof. Sarah Jenkins",
    text: "Excellent work on the final project. Your methodology and analysis were thorough. Keep up the great effort.",
  },
  {
    icon: Warning,
    iconColor: "text-danger",
    bgColor: "bg-danger/10",
    name: "Academic Warning",
    text: "Thermo lab attendance dropped 15% this month. Attendance is mandatory for lab sessions.",
  },
  {
    icon: Stars,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    name: "Dean's List Eligible",
    text: "On Track for Honor Roll. Your semester GPA qualifies you for Dean's List consideration.",
  },
];

const quarters = ["Q1 '23", "Q2 '23", "Q3 '23", "Q4 '23", "Q1 '24", "Current"];
const yourData = [3.2, 3.4, 3.5, 3.6, 3.7, 3.8];
const classAvg = [3.0, 3.05, 3.1, 3.15, 3.2, 3.25];

export default function PerformanceDashboardPage() {
  const maxGpa = 4.0;
  const minGpa = 2.0;
  const range = maxGpa - minGpa;

  const toHeight = (gpa: number) => ((gpa - minGpa) / range) * 100;

  return (
    <PageTransition>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Performance Dashboard"
          description="Track your academic progress, grades, and overall standing."
        />

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* ── Left Column ── */}
          <div className="space-y-6">
            {/* Cumulative GPA Hero Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Cumulative GPA</p>
                    <p className="mt-1 text-5xl font-bold tracking-tight text-text-primary">3.8</p>
                    <Badge variant="success" className="mt-2">
                      <TrendingUp className="mr-1 h-3.5 w-3.5" />
                      Excellent Standing
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-text-secondary">
                    <p>Total Credits: <span className="font-semibold text-text-primary">102</span></p>
                    <p>Rank: <span className="font-semibold text-text-primary">#14 / 450</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Comparison Card */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-text-primary">3.80</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-success">
                    <TrendingUp className="h-4 w-4" />
                    +0.15
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  vs Fall 2023 semester (3.65 GPA)
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="accent">Class Percentile: Top 3%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Status Card */}
            <Card className="border-warning/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Warning className="h-5 w-5 text-warning" />
                  <CardTitle>At-Risk Status</CardTitle>
                  <Badge variant="warning">High Focus</Badge>
                </div>
                <CardDescription>
                  Advanced Thermodynamics (ME-402) &mdash; Current grade (74%) is below your average
                  trend. Recommended 1:1 tutoring session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="primary" size="sm">
                  Book Support Session
                </Button>
              </CardContent>
            </Card>

            {/* Degree Completion Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Degree Completion</CardTitle>
                  <span className="text-sm font-semibold text-text-primary">85%</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: "85%" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-text-secondary">Major Core</p>
                    <p className="font-medium text-text-primary">48 / 52</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Electives</p>
                    <p className="font-medium text-text-primary">24 / 24</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Foundation</p>
                    <p className="font-medium text-text-primary">30 / 30</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Remaining</p>
                    <p className="font-medium text-text-primary">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance Trend</CardTitle>
                <CardDescription>GPA trajectory across quarters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-text-secondary">
                    <span>4.0</span>
                    <span>3.5</span>
                    <span>3.0</span>
                    <span>2.5</span>
                    <span>2.0</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-10 h-full">
                    {/* Grid lines */}
                    <div className="relative h-full">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 border-t border-border"
                          style={{ top: `${(i / 4) * 100}%` }}
                        />
                      ))}

                      {/* Bars */}
                      <div className="absolute inset-0 flex items-end gap-3 px-1">
                        {quarters.map((_, i) => {
                          const yourH = toHeight(yourData[i]);
                          const avgH = toHeight(classAvg[i]);
                          return (
                            <div key={i} className="flex flex-1 flex-col items-center gap-1" style={{ height: "100%" }}>
                              <div className="relative mt-auto flex w-full items-end justify-center gap-1" style={{ height: "85%" }}>
                                <div
                                  className="w-3 rounded-t bg-primary transition-all"
                                  style={{ height: `${yourH}%` }}
                                />
                                <div
                                  className="w-3 rounded-t bg-text-secondary/30 transition-all"
                                  style={{ height: `${avgH}%` }}
                                />
                              </div>
                              <span className="mt-1 text-[11px] text-text-secondary">{quarters[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-3 flex items-center justify-center gap-6 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded bg-primary" />
                      Your Performance
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded bg-text-secondary/30" />
                      Class Average
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">
            {/* Course Breakdown Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Breakdown</CardTitle>
                  <Badge variant="outline">Spring 2024</Badge>
                </div>
                <CardDescription>Current Term</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div key={course.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-text-primary">{course.name}</span>
                      <span className="text-text-secondary">{course.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className={`h-full rounded-full transition-all ${course.color}`}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbacks.map((fb) => {
                  const Icon = fb.icon;
                  return (
                    <div key={fb.name} className="flex gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fb.bgColor}`}>
                        <Icon className={`h-5 w-5 ${fb.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{fb.name}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{fb.text}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
