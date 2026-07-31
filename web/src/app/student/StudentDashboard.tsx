import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import StudentLayout from "@/components/layout/StudentLayout";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const quickStats = [
  {
    icon: BookOpen,
    label: "Active Courses",
    value: 4,
    iconClassName: "bg-blue-100 text-blue-600",
  },
  {
    icon: CheckCircle,
    label: "Assignments Done",
    value: 12,
    iconClassName: "bg-green-100 text-green-600",
  },
  {
    icon: Clock,
    label: "Pending Tasks",
    value: 3,
    iconClassName: "bg-amber-100 text-amber-600",
  },
  {
    icon: Trophy,
    label: "Avg. Score",
    value: "87%",
    iconClassName: "bg-purple-100 text-purple-600",
  },
];

const coursesInProgress = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    progress: 72,
    nextTask: "Week 8 Quiz",
    dueDate: "Mar 20",
  },
  {
    id: "2",
    title: "Data Structures & Algorithms",
    progress: 45,
    nextTask: "Assignment 3: Sorting",
    dueDate: "Mar 22",
  },
  {
    id: "3",
    title: "Linear Algebra",
    progress: 90,
    nextTask: "Final Project",
    dueDate: "Mar 25",
  },
];

const recentActivity = [
  {
    id: "1",
    action: "Submitted Assignment 2",
    course: "Data Structures & Algorithms",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: "2",
    action: "Completed Quiz - Week 7",
    course: "Introduction to CS",
    time: "Yesterday",
    status: "success",
  },
  {
    id: "3",
    action: "New lecture material available",
    course: "Linear Algebra",
    time: "2 days ago",
    status: "info",
  },
  {
    id: "4",
    action: "Assignment 3 opened",
    course: "Data Structures & Algorithms",
    time: "3 days ago",
    status: "warning",
  },
];

export default function StudentDashboard() {
  const [greeting] = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, Alex!
          </h1>
          <p className="mt-1 text-text-secondary">
            Here's your learning overview
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {quickStats.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                iconClassName={stat.iconClassName}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Courses in Progress
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/courses">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {coursesInProgress.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-surface"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">
                        {course.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Next: {course.nextTask} &middot; Due {course.dueDate}
                      </p>
                    </div>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                  <ProgressBar value={course.progress} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/notifications">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg p-2"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-green-100"
                        : activity.status === "warning"
                          ? "bg-amber-100"
                          : "bg-blue-100"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === "warning" ? (
                      <FileText className="h-4 w-4 text-amber-600" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {activity.action}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {activity.course} &middot; {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
