import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ClipboardCheck, BarChart3, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StepCard } from "@/components/ui/StepCard";
import {
  fadeInUp,
  staggerHero,
  staggerContainer,
  DURATION,
  EASE,
  STAGGER,
} from "@/lib/motion";

const modules = [
  {
    icon: BookOpen,
    title: "Courses & Materials",
    description:
      "Centralized repository for all syllabus, reading materials, and interactive lectures.",
    visual: "courses" as const,
  },
  {
    icon: ClipboardCheck,
    title: "Assignments & Quizzes",
    description:
      "Automated grading and submission tracking for efficient student evaluation cycles.",
    visual: "assignments" as const,
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description:
      "Real-time analytics and heatmaps to identify student progress and learning gaps.",
    visual: "performance" as const,
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated reminders for deadlines, grades, and important institutional updates.",
    visual: "notifications" as const,
  },
  {
    icon: Shield,
    title: "Admin Oversight",
    description:
      "Comprehensive dashboard for institutional administrators to manage faculty, students, and resources with ease.",
    visual: "admin" as const,
  },
];

const steps = [
  {
    number: "1",
    title: "Register",
    description:
      "Create your institutional or individual profile to unlock the platform's potential.",
    visual: "register" as const,
  },
  {
    number: "2",
    title: "Enroll",
    description:
      "Assign students to courses, upload content, and set your academic schedule.",
    visual: "enroll" as const,
  },
  {
    number: "3",
    title: "Learn",
    description:
      "Experience the difference with smart tracking and interactive learning tools.",
    visual: "learn" as const,
  },
];

export default function LandingPage() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════
          HERO — Split-Screen Layout
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-24 lg:py-32">
        {/* Subtle grid pattern for depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[55%_45%] lg:gap-8">
            {/* ── Left Column: Text ── */}
            <motion.div
              variants={prefersReduced ? undefined : staggerHero}
              initial="initial"
              animate="animate"
              className="max-w-xl"
            >
              {/* Eyebrow */}
              <motion.span
                variants={prefersReduced ? undefined : fadeInUp}
                transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
                className="inline-block rounded-full bg-accent-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent"
              >
                Smart Academy Guidance Engine
              </motion.span>

              {/* Headline */}
              <motion.h1
                variants={prefersReduced ? undefined : fadeInUp}
                transition={{
                  duration: DURATION.entrance / 1000,
                  ease: EASE.out,
                  delay: STAGGER.hero / 1000,
                }}
                className="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
              >
                Intelligent Education
                <span className="block mt-2 text-text-primary">
                  Your Academic Journey, Organized
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={prefersReduced ? undefined : fadeInUp}
                transition={{
                  duration: DURATION.entrance / 1000,
                  ease: EASE.out,
                  delay: (STAGGER.hero * 2) / 1000,
                }}
                className="mt-6 text-lg leading-8 text-text-secondary"
              >
                Empowering educators and students with a unified platform for
                seamless learning, tracking, and administrative excellence.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={prefersReduced ? undefined : fadeInUp}
                transition={{
                  duration: DURATION.entrance / 1000,
                  ease: EASE.out,
                  delay: (STAGGER.hero * 3) / 1000,
                }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <motion.div
                  whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  transition={{ duration: DURATION.fast / 1000 }}
                >
                  <Button size="lg" asChild>
                    <Link to="/register">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  transition={{ duration: DURATION.fast / 1000 }}
                >
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ── Right Column: Carousel ── */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: DURATION.entrance / 1000,
                ease: EASE.out,
                delay: 0.3,
              }}
            >
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MODULES — Illustrated Feature Cards
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReduced ? false : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
            >
              Powerful Tools for Every Educator
            </motion.h2>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="mt-4 text-lg text-text-secondary"
            >
              Streamline your institutional workflows with our comprehensive
              suite of academic management features.
            </motion.p>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {modules.map((module) => (
              <FeatureCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                visual={module.visual}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Illustrated Steps
          ═══════════════════════════════════════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReduced ? false : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="mt-4 text-lg text-text-secondary"
            >
              Three simple steps to transition your learning environment into the
              future.
            </motion.p>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8"
          >
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                visual={step.visual}
                isLast={i === steps.length - 1}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Final Call to Action
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReduced ? false : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
            >
              Ready to elevate your academic standard?
            </motion.h2>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="mt-4 text-lg text-text-secondary"
            >
              Join thousands of institutions using SAGE to power the next
              generation of scholars.
            </motion.p>
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="mt-8"
            >
              <motion.div
                whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                transition={{ duration: DURATION.fast / 1000 }}
                className="inline-block"
              >
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
