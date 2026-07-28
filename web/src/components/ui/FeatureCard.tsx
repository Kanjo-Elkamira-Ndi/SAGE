import { type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, DURATION, EASE } from "@/lib/motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: "courses" | "assignments" | "performance" | "notifications" | "admin";
}

function FeatureVisual({ type }: { type: FeatureCardProps["visual"] }) {
  switch (type) {
    case "courses":
      return (
        <div className="flex h-full items-center justify-center bg-primary-subtle/50 p-6">
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              {["bg-primary", "bg-accent", "bg-primary-light"].map((bg, i) => (
                <div key={i} className={`h-12 flex-1 rounded-lg ${bg}/20`} />
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 rounded-md border border-border bg-white p-2">
                  <div className="mb-1 h-6 rounded bg-primary-subtle" />
                  <div className="h-1.5 w-full rounded bg-border" />
                  <div className="mt-1 h-1.5 w-2/3 rounded bg-border" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "assignments":
      return (
        <div className="flex h-full items-center justify-center bg-accent-subtle/50 p-6">
          <div className="w-full space-y-2">
            <div className="rounded-lg border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="h-2 w-20 rounded bg-text-primary/20" />
                <div className="rounded-full bg-success/10 px-2 py-0.5 text-[8px] font-medium text-success">
                  Graded
                </div>
              </div>
              <div className="space-y-1.5">
                {["O(log n)", "O(n)", "O(n²)"].map((opt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded border px-2 py-1 text-[9px] ${
                      i === 0
                        ? "border-success bg-green-50 text-success"
                        : "border-border text-text-secondary"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-sm border ${
                        i === 0 ? "border-success bg-success" : "border-border"
                      }`}
                    />
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "performance":
      return (
        <div className="flex h-full items-center justify-center bg-primary-subtle/50 p-6">
          <div className="flex w-full items-center gap-4">
            {/* GPA Ring */}
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#E4E7EC" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#D4A017"
                  strokeWidth="3"
                  strokeDasharray="85 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-primary">3.8</span>
                <span className="text-[8px] text-text-secondary">GPA</span>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex flex-1 items-end gap-1">
              {[35, 55, 40, 70, 50, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary transition-all"
                  style={{ height: `${h * 0.5}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "notifications":
      return (
        <div className="flex h-full items-center justify-center bg-accent-subtle/50 p-6">
          <div className="w-full space-y-2">
            {[
              { color: "bg-accent", w: "w-full", label: "Deadline in 24h" },
              { color: "bg-success", w: "w-5/6", label: "Grade posted" },
              { color: "bg-primary-light", w: "w-4/6", label: "New material" },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2"
              >
                <div className={`h-2 w-2 rounded-full ${n.color}`} />
                <div className={`h-1.5 ${n.w} rounded bg-border`} />
                <span className="ml-auto whitespace-nowrap text-[8px] text-text-secondary">
                  {n.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "admin":
      return (
        <div className="flex h-full items-center justify-center bg-primary-subtle/50 p-6">
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              {[
                { label: "Users", value: "1,247", color: "text-primary" },
                { label: "Courses", value: "89", color: "text-accent" },
                { label: "Active", value: "98%", color: "text-success" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex-1 rounded-lg border border-border bg-white p-2 text-center"
                >
                  <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[7px] text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary-subtle" />
                <div className="h-1.5 flex-1 rounded bg-border" />
                <div className="h-1.5 w-8 rounded bg-success/20" />
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export function FeatureCard({ icon: Icon, title, description, visual }: FeatureCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={prefersReduced ? undefined : fadeInUp}
      transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      whileHover={prefersReduced ? undefined : { scale: 1.02, y: -4 }}
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow duration-300 hover:shadow-overlay"
    >
      {/* Visual area - top 60% */}
      <div className="relative h-40 overflow-hidden">
        <FeatureVisual type={visual} />
      </div>

      {/* Content area - bottom 40% */}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-primary">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </motion.div>
  );
}
