import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardCheck, BarChart3, Bell, Shield, CheckCircle, Calendar, TrendingDown, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const modules = [
  {
    icon: BookOpen,
    number: "01",
    title: "Courses & Materials",
    description: "A centralized hub for curriculum management. Faculty can architect courses with rich multimedia support, while students access a structured learning path organized by academic credits and prerequisites.",
    features: [
      "Dynamic syllabus builder with drag-and-drop hierarchy.",
      "Cloud-integrated resource repository (PDFs, Videos, External Links).",
      "Automated course enrollment based on prerequisite validation.",
    ],
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Assignments & Quizzes",
    description: "Sophisticated assessment tools designed for rigorous academic standards. Support for diverse quiz formats, secure proctoring integrations, and automated feedback loops to drive student improvement.",
    features: [
      "AI-assisted grading for objective assessments.",
      "Plagiarism detection and secure testing environment.",
      "Customizable rubrics for detailed qualitative feedback.",
    ],
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Performance Tracking",
    description: 'Data-driven insights visualized through a "High-Density Minimalist" lens. Administrators and faculty can monitor student trajectory through complex analytics, early warning systems, and predictive modeling.',
    stats: [
      { label: "Retention Accuracy", value: "94%" },
      { label: "Grade Analytics", value: "Live" },
    ],
  },
  {
    icon: Bell,
    number: "04",
    title: "Smart Notifications",
    description: "Proactive communication through automated triggers. SAGE ensures students never miss a deadline and faculty stay informed of critical administrative tasks through multi-channel delivery.",
    features: [
      { icon: Calendar, text: "Deadline Reminders: Automatic pings 48h and 24h before assignment closures." },
      { icon: TrendingDown, text: "At-Risk Alerts: Instant notification if a student falls below a specified GPA threshold." },
    ],
  },
  {
    icon: Shield,
    number: "05",
    title: "Admin Oversight",
    description: "Granular control for institution leaders. Manage user roles, audit system logs, and configure platform-wide settings with a robust permission engine tailored for complex hierarchy levels.",
    features: [
      { icon: Settings, text: "Role-Based Access Control (RBAC)" },
      { icon: History, text: "Complete Audit Trails & History" },
      { icon: Settings, text: "Institutional Setting Overrides" },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Core Engineering for Education
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Discover the modular architecture behind SAGE, designed to streamline administrative complexity and empower academic excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {modules.map((module, index) => (
              <div
                key={module.number}
                className={`flex flex-col gap-8 lg:flex-row lg:items-start ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm font-semibold text-accent">
                    <span>Module {module.number}</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-primary">{module.title}</h2>
                  <p className="mt-4 text-text-secondary leading-relaxed">
                    {module.description}
                  </p>

                  {/* Features List */}
                  {module.features && (
                    <ul className="mt-6 space-y-3">
                      {module.features.map((feature, i) => {
                        const Icon = typeof feature === "object" && "icon" in feature ? feature.icon : CheckCircle;
                        const text = typeof feature === "string" ? feature : feature.text;
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                            <span className="text-text-secondary">{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Stats */}
                  {module.stats && (
                    <div className="mt-6 flex gap-8">
                      {module.stats.map((stat) => (
                        <div key={stat.label}>
                          <div className="text-3xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-text-secondary">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual Placeholder */}
                <div className="flex-1">
                  <Card className="h-64 bg-surface">
                    <CardContent className="flex h-full items-center justify-center">
                      <module.icon className="h-16 w-16 text-primary-subtle" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Ready to Evolve Your Academy?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Join hundreds of institutions using SAGE to deliver high-quality, data-driven education experiences.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Schedule a Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
