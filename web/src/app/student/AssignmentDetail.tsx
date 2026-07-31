import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  FileText,
  CheckCircle,
  Upload,
  Download,
  AlertCircle,
  Star,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const assignmentData = {
  id: "1",
  title: "Assignment 1: Basic Programs",
  course: "Introduction to Computer Science",
  courseCode: "CS101",
  dueDate: "Feb 8, 2026",
  submittedDate: "Feb 7, 2026",
  status: "graded",
  grade: "92/100",
  feedback:
    "Excellent work, Alex! Your implementation of the factorial function was elegant. For the sorting section, consider using a more efficient algorithm for larger datasets. Overall, great understanding of the fundamentals.",
  rubric: [
    { criterion: "Correctness", score: 48, max: 50 },
    { criterion: "Code Style", score: 18, max: 20 },
    { criterion: "Documentation", score: 16, max: 20 },
    { criterion: "Efficiency", score: 10, max: 10 },
  ],
  description:
    "Write a program that demonstrates your understanding of basic programming concepts including variables, control flow, loops, and functions.",
  requirements: [
    "Implement a function to calculate factorial recursively",
    "Create a program that sorts an array of integers",
    "Write a program to find the nth Fibonacci number",
    "Include comments explaining your logic",
    "Submit as a single .py file",
  ],
  attachments: [
    { name: "assignment_1.py", size: "3.2 KB" },
    { name: "output_screenshot.png", size: "156 KB" },
  ],
};

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const a = assignmentData;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/student/assignments">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Assignments
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {a.title}
              </h1>
              <p className="mt-1 text-text-secondary">
                {a.course} ({a.courseCode})
              </p>
            </div>
            <Badge
              className={
                a.status === "graded"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }
              variant="secondary"
            >
              {a.status === "graded" ? "Graded" : "Submitted"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Description
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {a.description}
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Requirements
              </h2>
              <ul className="space-y-2">
                {a.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </Card>

            {a.status === "graded" && (
              <Card className="p-5">
                <h2 className="mb-3 text-lg font-semibold text-text-primary">
                  Instructor Feedback
                </h2>
                <div className="rounded-lg bg-primary-subtle p-4">
                  <p className="text-sm text-text-primary leading-relaxed">
                    {a.feedback}
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {a.rubric.map((item) => (
                    <div key={item.criterion}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-text-primary">
                          {item.criterion}
                        </span>
                        <span className="font-medium text-text-primary">
                          {item.score}/{item.max}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{
                            width: `${(item.score / item.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Your Submission
              </h2>
              <div className="space-y-2">
                {a.attachments.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {file.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-text-secondary">Due:</span>
                  <span className="text-text-primary">{a.dueDate}</span>
                </div>
                {a.submittedDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-text-secondary">Submitted:</span>
                    <span className="text-text-primary">{a.submittedDate}</span>
                  </div>
                )}
                {a.grade && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-text-secondary">Grade:</span>
                    <span className="font-bold text-accent">{a.grade}</span>
                  </div>
                )}
              </div>
            </Card>

            {a.status === "submitted" || a.status === "pending" ? (
              <Card className="p-5">
                <h2 className="mb-3 text-lg font-semibold text-text-primary">
                  Resubmit
                </h2>
                <div className="space-y-3">
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-secondary">
                      Drop files here or click to upload
                    </p>
                  </div>
                  <Button className="w-full">Upload & Submit</Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
