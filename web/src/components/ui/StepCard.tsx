import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, DURATION, EASE } from "@/lib/motion";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  visual: "register" | "enroll" | "learn";
  isLast?: boolean;
}

function StepVisual({ type }: { type: StepCardProps["visual"] }) {
  switch (type) {
    case "register":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="w-32 space-y-2">
            <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
              <div className="mb-1 h-1.5 w-12 rounded bg-text-primary/20" />
              <div className="h-5 rounded border border-border bg-surface" />
            </div>
            <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
              <div className="mb-1 h-1.5 w-16 rounded bg-text-primary/20" />
              <div className="h-5 rounded border border-border bg-surface" />
            </div>
            <div className="rounded-lg bg-primary px-3 py-1.5 text-center text-[9px] font-medium text-white">
              Create Account
            </div>
          </div>
        </div>
      );

    case "enroll":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-14 w-10 rounded-lg border ${
                  i === 2
                    ? "border-primary bg-primary-subtle"
                    : "border-border bg-white"
                } shadow-sm`}
              />
            ))}
          </div>
        </div>
      );

    case "learn":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative">
            {/* Book/document shape */}
            <div className="h-16 w-20 rounded-lg border border-border bg-white shadow-sm">
              <div className="border-b border-border p-1.5">
                <div className="h-1 w-8 rounded bg-primary/30" />
              </div>
              <div className="space-y-1 p-1.5">
                <div className="h-1 w-full rounded bg-border" />
                <div className="h-1 w-3/4 rounded bg-border" />
                <div className="h-1 w-5/6 rounded bg-border" />
              </div>
            </div>
            {/* Progress indicator */}
            <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-success text-[8px] text-white">
              ✓
            </div>
          </div>
        </div>
      );
  }
}

export function StepCard({ number, title, description, visual, isLast }: StepCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={prefersReduced ? undefined : fadeInUp}
      transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Visual */}
      <div className="mb-4 flex h-24 items-center justify-center">
        <StepVisual type={visual} />
      </div>

      {/* Number badge */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
        {number}
      </div>

      {/* Content */}
      <h3 className="mt-3 text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-2 max-w-[200px] text-sm text-text-secondary">{description}</p>

      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[calc(50%+24px)] top-[calc(50%-12px)] hidden h-px w-[calc(100%-48px)] bg-gradient-to-r from-border to-transparent sm:block" />
      )}
    </motion.div>
  );
}
