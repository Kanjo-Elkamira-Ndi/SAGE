import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Search,
  Filter,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const allCourses = [
  {
    id: "1",
    code: "CS101",
    title: "Introduction to Computer Science",
    instructor: "Dr. Sarah Chen",
    progress: 72,
    grade: "A-",
    term: "Spring 2026",
    modules: 8,
    completed: 6,
    image: null,
  },
  {
    id: "2",
    code: "CS201",
    title: "Data Structures & Algorithms",
    instructor: "Prof. Michael Torres",
    progress: 45,
    grade: "B+",
    term: "Spring 2026",
    modules: 12,
    completed: 5,
    image: null,
  },
  {
    id: "3",
    code: "MATH251",
    title: "Linear Algebra",
    instructor: "Dr. Emily Park",
    progress: 90,
    grade: "A",
    term: "Spring 2026",
    modules: 10,
    completed: 9,
    image: null,
  },
  {
    id: "4",
    code: "ENG102",
    title: "Academic Writing",
    instructor: "Prof. James Wilson",
    progress: 60,
    grade: "B",
    term: "Spring 2026",
    modules: 6,
    completed: 4,
    image: null,
  },
  {
    id: "5",
    code: "PHYS101",
    title: "Physics I: Mechanics",
    instructor: "Dr. Anita Kumar",
    progress: 30,
    grade: null,
    term: "Spring 2026",
    modules: 4,
    completed: 1,
    image: null,
  },
  {
    id: "6",
    code: "HIST201",
    title: "World History: Modern Era",
    instructor: "Prof. David Okafor",
    progress: 15,
    grade: null,
    term: "Spring 2026",
    modules: 3,
    completed: 0,
    image: null,
  },
];

export default function MyCourses() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = allCourses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "in-progress")
      return matchesSearch && c.progress > 0 && c.progress < 100;
    if (filter === "completed") return matchesSearch && c.progress === 100;
    if (filter === "not-started") return matchesSearch && c.progress === 0;
    return matchesSearch;
  });

  return (
    <StudentLayout>
      <div className="space-y-6">
        <PageHeader title="My Courses" description="View and manage your enrolled courses">
          <Button asChild>
            <Link to="/student/courses/browse">
              <GraduationCap className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
        </PageHeader>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "in-progress", "completed", "not-started"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "in-progress"
                    ? "In Progress"
                    : f === "completed"
                      ? "Completed"
                      : "Not Started"}
              </Button>
            ))}
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeInUp}>
              <Link to={`/student/courses/${course.id}`}>
                <Card className="group cursor-pointer p-5 transition-all hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{course.code}</Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {course.instructor}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {course.term}
                  </p>
                  <div className="mt-4">
                    <ProgressBar value={course.progress} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                    <span>
                      {course.completed}/{course.modules} modules
                    </span>
                    <div className="flex items-center gap-1">
                      {course.grade && (
                        <span className="font-medium text-accent">
                          {course.grade}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </StudentLayout>
  );
}
