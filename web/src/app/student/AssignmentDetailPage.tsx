import {
  Clock,
  Calendar,
  ChevronRight,
  FileText,
  Download,
  Upload,
  CheckCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";

const instructions = [
  "Implement the Ford-Fulkerson algorithm to compute maximum flow in a directed graph. Provide both the pseudocode and a working Python implementation.",
  "Prove the max-flow min-cut theorem for the given network. Show all intermediate steps including residual graph construction at each iteration.",
  "Analyze the time complexity of your implementation and compare it with the Edmonds-Karp algorithm. Discuss real-world applications of network flow in transportation systems.",
];

const rubric = [
  { criterion: "Implementation", max: 40, score: 36 },
  { criterion: "Complexity Proof", max: 30, score: 28 },
  { criterion: "Documentation", max: 20, score: 18 },
  { criterion: "Efficiency", max: 10, score: 9 },
];

export default function AssignmentDetailPage() {
  return (
    <PageTransition>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-gutter)] py-8">
        <nav className="flex items-center gap-2 text-label-sm text-text-secondary mb-6">
          <span>CS 402: Advanced Algorithms</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-text-primary font-medium">Assignment 04</span>
        </nav>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-headline-lg font-bold text-text-primary">
              Graph Theory & Network Flow
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                <Calendar className="h-4 w-4" />
                Thursday, Oct 24th, 2023
              </span>
              <Badge variant="warning" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                02:14:55 Remaining Time
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 list-decimal list-inside">
                  {instructions.map((text, i) => (
                    <li key={i} className="text-body-sm text-text-primary leading-relaxed">
                      {text}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attached File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-text-primary truncate">
                      Algorithm_Template_v2.zip
                    </p>
                    <p className="text-label-sm text-text-secondary">2.4 MB</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previous Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-headline-md font-bold text-text-primary">
                      95<FileText className="h-4 w-4 text-text-secondary ml-1" />
                      <span className="text-body-sm font-normal text-text-secondary">/100</span>
                    </span>
                    <p className="text-label-sm text-text-secondary mt-0.5">
                      Submitted Oct 20, 2023
                    </p>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Graded
                  </Badge>
                </div>
                <div className="rounded-lg bg-primary-subtle p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-body-sm font-semibold text-text-primary">
                      Lecturer Feedback
                    </span>
                  </div>
                  <p className="text-body-sm text-text-secondary">
                    Excellent work on the complexity analysis. Your proof of the max-flow min-cut
                    theorem was rigorous. Consider adding more edge cases to your implementation.
                  </p>
                  <p className="text-label-sm text-text-secondary mt-2">— Dr. Aris Thorne</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-10 transition-colors hover:border-primary hover:bg-primary-subtle/30 cursor-pointer">
                  <Upload className="h-8 w-8 text-text-secondary mb-3" />
                  <p className="text-body-sm font-medium text-text-primary">
                    Drag & drop your file here
                  </p>
                  <p className="text-label-sm text-text-secondary mt-1">or click to browse</p>
                </div>
                <p className="text-label-sm text-text-secondary mt-3">
                  Accepted formats: .pdf, .zip, .py, .ipynb (Max 50 MB)
                </p>
                <Button className="mt-4">
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </Button>
              </CardContent>
            </Card>
          </div>

          <aside className="w-80 shrink-0">
            <Card>
              <CardHeader>
                <CardTitle>Grading Rubric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {rubric.map((item) => (
                  <div key={item.criterion}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-body-sm text-text-primary">{item.criterion}</span>
                      <span className="text-label-sm text-text-secondary">
                        {item.score}/{item.max}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.score}
                      max={item.max}
                      size="sm"
                      variant={item.score / item.max >= 0.8 ? "success" : "primary"}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
