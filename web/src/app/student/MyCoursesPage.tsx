import {
  School,
  TrendingUp,
  Grade,
  Add,
  FilterList,
  Person,
  PlayCircle,
  BookOpen,
  ChevronRight,
  LibraryAdd,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

const courses = [
  { code: "CS101", title: "Introduction to Computer Science", lecturer: "Dr. Alan Turing", progress: 75 },
  { code: "ECO204", title: "Macroeconomic Theory", lecturer: "Prof. Sarah Keynes", progress: 32 },
  { code: "BIO110", title: "Molecular Biology", lecturer: "Dr. Elizabeth Blackwell", progress: 90 },
  { code: "ARC301", title: "Modern Architecture", lecturer: "Prof. Frank Gehry", progress: 45 },
  { code: "ENG220", title: "Creative Writing", lecturer: "Dr. Maya Angelou", progress: 15 },
];

export default function MyCoursesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <PageHeader title="My Enrolled Courses" description="Manage your academic progress">
        <Button variant="ghost" size="md">
          <FilterList className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="primary" size="md">
          <Add className="h-4 w-4" />
          Enroll New Course
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
        <StatCard
          icon={School}
          label="Active Courses"
          value={6}
          iconContainerClass="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Progress"
          value="72%"
          iconContainerClass="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle"
          subtext="6% increase this month"
        />
        <StatCard
          icon={Grade}
          label="Credits Earned"
          value={48}
          iconContainerClass="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50"
          subtext="12 credits remaining"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.code} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">{course.code}</Badge>
                </div>
                <CardTitle className="mt-3">{course.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Person className="h-3.5 w-3.5 shrink-0" />
                  {course.lecturer}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Course Progress</span>
                    <span className="font-medium text-text-primary">{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} showLabel={false} />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  <BookOpen className="h-4 w-4" />
                  Materials
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  <PlayCircle className="h-4 w-4" />
                  Continue
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enroll in More</CardTitle>
              <CardDescription>Explore new subjects this semester</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { code: "PH201", title: "Modern Physics" },
                { code: "PS101", title: "Introduction to Psychology" },
                { code: "ST301", title: "Statistical Methods" },
              ].map((c) => (
                <div key={c.code} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface transition-colors cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle">
                    <LibraryAdd className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{c.code}</p>
                    <p className="text-xs text-text-secondary truncate">{c.title}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                Browse All Courses
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">CS101</p>
                    <p className="text-xs text-text-secondary truncate">
                      Week 8: Data Structures & Algorithms
                    </p>
                  </div>
                </div>
                <ProgressBar value={75} size="sm" showLabel={false} />
                <p className="text-xs text-text-secondary mt-2">75% complete</p>
                <Button variant="primary" size="sm" className="w-full mt-3">
                  <PlayCircle className="h-4 w-4" />
                  Resume Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
