import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  Clock,
  FileText,
  Users,
  Calendar,
  Download,
  Play,
  CheckCircle,
  Lock,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TabNav } from "@/components/ui/TabNav";
import { PageHeader } from "@/components/ui/PageHeader";

const courseData = {
  id: "1",
  code: "CS101",
  title: "Introduction to Computer Science",
  instructor: "Dr. Sarah Chen",
  instructorBio:
    "PhD in Computer Science from MIT. 10+ years teaching experience.",
  instructorAvatar: null,
  schedule: "Mon, Wed, Fri 10:00 - 11:30 AM",
  location: "Room 301, Science Building",
  term: "Spring 2026",
  progress: 72,
  grade: "A-",
  description:
    "An introduction to the fundamental concepts of computer science. Topics include computational thinking, programming fundamentals, data representation, algorithms, and the societal impact of computing. This course provides a foundation for further study in computer science.",
  modules: [
    {
      id: "m1",
      title: "Week 1: Introduction & Computational Thinking",
      type: "lecture",
      status: "completed",
      duration: "3 hours",
      completedAt: "Jan 15, 2026",
    },
    {
      id: "m2",
      title: "Week 2: Variables & Data Types",
      type: "lecture",
      status: "completed",
      duration: "3 hours",
      completedAt: "Jan 22, 2026",
    },
    {
      id: "m3",
      title: "Week 3: Control Flow & Loops",
      type: "lecture",
      status: "completed",
      duration: "3 hours",
      completedAt: "Jan 29, 2026",
    },
    {
      id: "m4",
      title: "Week 4: Functions & Modular Programming",
      type: "lecture",
      status: "completed",
      duration: "3 hours",
      completedAt: "Feb 5, 2026",
    },
    {
      id: "m5",
      title: "Assignment 1: Basic Programs",
      type: "assignment",
      status: "completed",
      duration: "1 week",
      completedAt: "Feb 8, 2026",
    },
    {
      id: "m6",
      title: "Week 5: Arrays & Lists",
      type: "lecture",
      status: "completed",
      duration: "3 hours",
      completedAt: "Feb 12, 2026",
    },
    {
      id: "m7",
      title: "Week 6: Searching & Sorting Algorithms",
      type: "lecture",
      status: "in_progress",
      duration: "3 hours",
    },
    {
      id: "m8",
      title: "Assignment 2: Algorithm Implementation",
      type: "assignment",
      status: "pending",
      duration: "1 week",
      dueDate: "Mar 28, 2026",
    },
    {
      id: "m9",
      title: "Week 7: Introduction to OOP",
      type: "lecture",
      status: "locked",
      duration: "3 hours",
    },
    {
      id: "m10",
      title: "Midterm Exam",
      type: "exam",
      status: "locked",
      duration: "2 hours",
    },
  ],
  announcements: [
    {
      id: "a1",
      title: "Assignment 2 Now Available",
      content:
        "Assignment 2 on Algorithm Implementation is now available in the assignments section. Due date: March 28.",
      date: "Mar 14, 2026",
      author: "Dr. Sarah Chen",
    },
    {
      id: "a2",
      title: "Office Hours Change",
      content:
        "Office hours for this week have been moved to Thursday 2-4 PM.",
      date: "Mar 12, 2026",
      author: "Dr. Sarah Chen",
    },
  ],
  upcoming: [
    { title: "Assignment 2 Due", date: "Mar 28, 2026", type: "assignment" },
    { title: "Week 7 Quiz", date: "Mar 30, 2026", type: "quiz" },
    { title: "Midterm Exam", date: "Apr 10, 2026", type: "exam" },
  ],
};

const statusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Play className="h-4 w-4 text-primary" />;
    case "pending":
      return <Clock className="h-4 w-4 text-amber-500" />;
    default:
      return <Lock className="h-4 w-4 text-text-muted" />;
  }
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const [tab, setTab] = useState("modules");

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/student/courses">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <PageHeader
            title={`${courseData.code}: ${courseData.title}`}
            description={`${courseData.term} · ${courseData.instructor}`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                About This Course
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {courseData.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Calendar className="h-4 w-4 text-primary" />
                  {courseData.schedule}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Users className="h-4 w-4 text-primary" />
                  {courseData.location}
                </div>
              </div>
            </Card>

            <TabNav
              tabs={[
                { id: "modules", label: "Modules" },
                { id: "announcements", label: "Announcements" },
              ]}
              activeTab={tab}
              onTabChange={setTab}
            />

            {tab === "modules" && (
              <div className="space-y-2">
                {courseData.modules.map((module) => (
                  <Card
                    key={module.id}
                    className={`p-4 transition-colors ${
                      module.status === "locked"
                        ? "opacity-60"
                        : "hover:border-primary/30 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{statusIcon(module.status)}</div>
                        <div>
                          <h3 className="font-medium text-text-primary">
                            {module.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                            <span className="capitalize">{module.type}</span>
                            <span>{module.duration}</span>
                            {module.status === "completed" && module.completedAt && (
                              <span>Completed {module.completedAt}</span>
                            )}
                            {"dueDate" in module && module.dueDate && (
                              <span className="text-amber-600">
                                Due {module.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.status === "completed" && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {(module.status === "in_progress" ||
                          module.status === "pending") && (
                          <Button size="sm">Continue</Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {tab === "announcements" && (
              <div className="space-y-3">
                {courseData.announcements.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="font-medium text-text-primary">
                        {a.title}
                      </h3>
                      <span className="text-xs text-text-secondary">
                        {a.date}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{a.content}</p>
                    <p className="mt-2 text-xs text-text-secondary">
                      — {a.author}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Your Progress
              </h2>
              <div className="flex items-center justify-center py-4">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="6"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      className="text-accent"
                      strokeWidth="6"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * courseData.progress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-text-primary">
                    {courseData.progress}%
                  </span>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-center text-sm text-text-secondary">
                <p>Grade: <span className="font-semibold text-accent">{courseData.grade}</span></p>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Upcoming
              </h2>
              <div className="space-y-3">
                {courseData.upcoming.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Instructor
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  SC
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    {courseData.instructor}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {courseData.instructorBio}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
