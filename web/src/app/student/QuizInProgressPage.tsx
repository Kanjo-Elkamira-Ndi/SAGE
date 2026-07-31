import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";

const totalQuestions = 10;
const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

export default function QuizInProgressPage() {
  const [current, setCurrent] = useState(3);
  const [answered, setAnswered] = useState<number[]>([1, 2]);

  const isAnswered = answered.includes(current);
  const progress = Math.round((current / totalQuestions) * 100);

  return (
    <PageTransition>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-gutter)] py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-label-sm text-text-secondary mb-1">
              Principles of Macroeconomics - Midterm Assessment
            </p>
            <h1 className="text-headline-md font-bold text-text-primary">
              Unit 4: Monetary Policy
            </h1>
          </div>
          <Badge variant="warning" className="gap-1.5 text-body-sm py-2 px-4">
            <Clock className="h-4 w-4" />
            24:15
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-body-sm text-text-secondary">
            Question {current} of {totalQuestions}
          </p>
          <span className="text-label-sm text-text-secondary">{progress}% Complete</span>
        </div>

        <ProgressBar value={progress} size="md" variant="primary" className="mb-8" />

        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Badge variant="default" className="mb-4">
                  Multiple Choice
                </Badge>
                <h2 className="text-body-lg font-semibold text-text-primary mb-6 leading-relaxed">
                  The Federal Reserve's dual mandate consists of which two primary objectives?
                </h2>

                <div className="space-y-3">
                  {[
                    "Maximum employment and stable prices",
                    "Economic growth and balanced trade",
                    "Low inflation and high government spending",
                    "Full employment and current account surplus",
                  ].map((option, i) => {
                    const id = `option-${i}`;
                    return (
                      <label
                        key={i}
                        className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          isAnswered && i === 0
                            ? "border-primary bg-primary-subtle"
                            : "border-border hover:border-primary-light hover:bg-surface"
                        }`}
                      >
                        <div className="relative flex h-5 w-5 shrink-0 mt-0.5">
                          <input
                            type="radio"
                            name="quiz-option"
                            className="peer sr-only"
                            defaultChecked={isAnswered && i === 0}
                          />
                          <div className="h-5 w-5 rounded-full border-2 border-border peer-checked:border-primary peer-checked:after:block after:hidden after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:h-2.5 after:w-2.5 after:rounded-full after:bg-primary" />
                        </div>
                        <span className="text-body-sm text-text-primary">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="ghost" className="gap-1.5" disabled={current === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="gap-1.5">
                  <SkipForward className="h-4 w-4" />
                  Skip Question
                </Button>
                <Button variant="primary" className="gap-1.5">
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <aside className="w-64 shrink-0">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-body-sm font-semibold text-text-primary mb-4">
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q) => {
                    const isCurrent = q === current;
                    const isAnswer = answered.includes(q);
                    return (
                      <button
                        key={q}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-label-sm font-medium transition-colors ${
                          isCurrent
                            ? "bg-primary text-text-on-primary"
                            : isAnswer
                              ? "bg-success/10 text-success border border-success/30"
                              : "bg-surface text-text-secondary border border-border hover:border-primary-light hover:text-primary"
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
