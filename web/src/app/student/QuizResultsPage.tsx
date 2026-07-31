import { useState } from "react";
import {
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Video,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageTransition } from "@/components/layout/PageTransition";

const reviewedQuestions = [
  {
    id: 1,
    question: "What is the time complexity of the Bellman-Ford algorithm?",
    options: ["O(V + E)", "O(V log V)", "O(V × E)", "O(V²)"],
    correct: 2,
    selected: 2,
    explanation:
      "The Bellman-Ford algorithm relaxes all edges V-1 times, resulting in a time complexity of O(V × E), where V is the number of vertices and E is the number of edges.",
  },
  {
    id: 2,
    question: "Which data structure is best suited for implementing LRU cache?",
    options: ["Priority Queue", "Hash Map + Doubly Linked List", "Binary Search Tree", "Array"],
    correct: 1,
    selected: 0,
    explanation:
      "A combination of a Hash Map (for O(1) lookups) and a Doubly Linked List (for O(1) insertions/deletions) provides the most efficient LRU cache implementation.",
  },
];

const tabs = ["All", "Incorrect"] as const;

const recommended = [
  {
    icon: BookOpen,
    title: "Reading: Complexity Theory",
    description: "Chapter 7 - Algorithm Analysis",
    variant: "primary-subtle" as const,
    iconColor: "text-primary" as const,
  },
  {
    icon: Video,
    title: "Video: AVL Tree Rotations",
    description: "Visual explanation of tree balancing",
    variant: "accent-subtle" as const,
    iconColor: "text-accent" as const,
  },
  {
    icon: Code,
    title: "Practice: Graph Traversals",
    description: "Interactive coding challenges",
    variant: "primary-subtle" as const,
    iconColor: "text-primary" as const,
  },
];

export default function QuizResultsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");

  return (
    <PageTransition>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-gutter)] py-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <svg className="h-36 w-36" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#E4E7EC" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="8"
                strokeDasharray={`${(88 / 100) * 339.292} 339.292`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="56" textAnchor="middle" className="text-headline-lg font-bold" fill="#2D2E33">
                88%
              </text>
              <text x="60" y="74" textAnchor="middle" className="text-label-sm" fill="#5B5F69">
                SCORE
              </text>
            </svg>
          </div>
          <h2 className="text-headline-md font-bold text-text-primary">Congratulations, Sarah!</h2>
          <Badge variant="success" className="mt-2 gap-1.5 px-4 py-1.5">
            <CheckCircle className="h-4 w-4" />
            PASS - MASTERY ACHIEVED
          </Badge>
          <p className="text-body-sm text-text-secondary mt-3 max-w-md">
            You have demonstrated exceptional understanding of the subject matter. Your consistent
            performance across all sections reflects strong mastery of the material.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button variant="primary" className="gap-2">
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
            <Button variant="secondary" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Result
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-text-secondary">Correct Answers</p>
                <p className="text-headline-md font-bold text-text-primary mt-1">22/25</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-text-secondary">Time Taken</p>
                <p className="text-headline-md font-bold text-text-primary mt-1">14:22 mins</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-text-secondary">Avg Time/Question</p>
                <p className="text-headline-md font-bold text-text-primary mt-1">34.4s</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-text-secondary">Class Percentile</p>
                <p className="text-headline-md font-bold text-text-primary mt-1">Top 5%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question Review</CardTitle>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 rounded-md text-label-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary text-text-on-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewedQuestions.map((q) => {
              const isCorrect = q.selected === q.correct;
              if (activeTab === "Incorrect" && isCorrect) return null;
              return (
                <div key={q.id} className="rounded-lg border border-border p-5">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-body-sm font-medium text-text-primary mb-3">
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          let className = "rounded-lg border-2 px-4 py-2.5 text-body-sm ";
                          if (oi === q.correct) {
                            className += "border-success bg-success/10 text-success";
                          } else if (oi === q.selected && !isCorrect) {
                            className += "border-danger bg-danger/10 text-danger";
                          } else {
                            className += "border-border text-text-secondary";
                          }
                          return (
                            <div key={oi} className={className}>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 rounded-lg bg-primary-subtle p-3">
                        <p className="text-label-sm font-semibold text-text-primary mb-1">
                          Explanation
                        </p>
                        <p className="text-body-sm text-text-secondary">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {recommended.map((item, i) => (
                <Card key={i} className="p-5 border border-border hover:shadow-overlay transition-shadow cursor-pointer">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${item.variant} mb-3`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <h4 className="text-body-sm font-semibold text-text-primary mb-1">{item.title}</h4>
                  <p className="text-label-sm text-text-secondary">{item.description}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
