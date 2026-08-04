import { GraduationCap, Bell, ClipboardList, Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/features/admin/components/ui";

const emptyStates = [
  {
    icon: GraduationCap,
    title: "No courses yet",
    desc: "Your academic catalog is currently empty. Start by creating a new curriculum or importing data.",
    cta: "Create Course",
  },
  {
    icon: Bell,
    title: "No notifications",
    desc: "Everything is up to date! We'll let you know when there are new activities or administrative alerts.",
    cta: "Check Alerts",
  },
  {
    icon: ClipboardList,
    title: "No submissions",
    desc: "There are no pending student submissions for review in your active grading queue.",
    cta: "View Queue",
  },
];

export default function EmptyStatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Empty State Variants"
        description="Standardized system patterns for handling missing or null data across the SAGE Institution platform."
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {emptyStates.map(({ icon: Icon, title, desc, cta }) => (
          <Card
            key={title}
            className="flex flex-col items-center px-6 py-12 text-center"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-admin-royal-soft text-admin-royal">
              <Icon className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-semibold tracking-tight text-text-primary">
              {title}
            </h4>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-admin-text-muted">
              {desc}
            </p>
            <Button size="sm" className="mt-6">
              <Plus className="h-4 w-4" />
              {cta}
            </Button>
          </Card>
        ))}
      </section>

      {/* System pattern guidelines */}
      <Card className="border-admin-royal-soft bg-admin-royal-soft/30 p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-admin-royal" />
          <h4 className="text-lg font-semibold tracking-tight">
            System Pattern Guidelines
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-admin-royal">
              Visual Hierarchy
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-admin-text-muted">
              Icons use a Royal Blue outline with a light weight for a modern,
              breathable aesthetic. Content is centered to maintain focus in
              empty data states.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-admin-royal">
              Action-Oriented
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-admin-text-muted">
              Every empty state must provide a clear primary call-to-action
              (CTA) to guide the user toward the next logical step in their
              workflow.
            </p>
          </div>
        </div>
        <p className="mt-6 border-t border-admin-royal-soft pt-4 text-center text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
          SAGE Design System V2.4 · Academic Component Library
        </p>
      </Card>
    </div>
  );
}
