import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DURATION, EASE } from "@/lib/motion";

interface CarouselSlide {
  id: number;
  title: string;
  mockup: "courses" | "performance" | "notifications" | "quiz";
}

const slides: CarouselSlide[] = [
  { id: 1, title: "Access materials anywhere", mockup: "courses" },
  { id: 2, title: "Track your performance", mockup: "performance" },
  { id: 3, title: "Never miss a deadline", mockup: "notifications" },
  { id: 4, title: "Instant quiz feedback", mockup: "quiz" },
];

function MiniUIMockup({ type }: { type: CarouselSlide["mockup"] }) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-white shadow-card">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <div className="ml-2 flex-1 rounded bg-background px-2 py-0.5 text-[8px] text-text-secondary">
          sage-engine.edu
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {type === "courses" && <CoursesMockup />}
        {type === "performance" && <PerformanceMockup />}
        {type === "notifications" && <NotificationsMockup />}
        {type === "quiz" && <QuizMockup />}
      </div>

      {/* Ambient glow behind mockup */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
      )}
    </div>
  );
}

function CoursesMockup() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-24 rounded bg-primary/20" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-2">
            <div className="mb-1 h-8 rounded bg-primary-subtle" />
            <div className="h-2 w-full rounded bg-border" />
            <div className="mt-1 h-2 w-3/4 rounded bg-border" />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 w-8 rounded-full bg-primary" />
        <div className="h-1.5 w-1.5 rounded-full bg-border" />
        <div className="h-1.5 w-1.5 rounded-full bg-border" />
      </div>
    </div>
  );
}

function PerformanceMockup() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-20 rounded bg-primary/20" />
      <div className="flex gap-2">
        {/* GPA Ring */}
        <div className="relative flex h-16 w-16 items-center justify-center">
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
          <span className="absolute text-xs font-bold text-primary">3.8</span>
        </div>
        {/* Mini chart */}
        <div className="flex-1 space-y-1">
          <div className="h-2 w-full rounded bg-border" />
          <div className="h-2 w-5/6 rounded bg-border" />
          <div className="h-2 w-4/6 rounded bg-border" />
          <div className="flex gap-0.5">
            {[40, 60, 45, 80, 55, 70, 85].map((h, i) => (
              <div
                key={i}
                className="w-2 rounded-t bg-primary"
                style={{ height: `${h * 0.3}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsMockup() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-20 rounded bg-primary/20" />
      {[
        { icon: "!", color: "bg-accent", text: "Assignment due in 24h" },
        { icon: "✓", color: "bg-success", text: "Quiz graded: 92%" },
        { icon: "📄", color: "bg-primary-subtle", text: "New material uploaded" },
      ].map((n, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${n.color} text-[8px] text-white`}>
            {n.icon}
          </div>
          <div className="h-2 flex-1 rounded bg-border" />
          <span className="text-[8px] text-text-secondary">{n.text}</span>
        </div>
      ))}
    </div>
  );
}

function QuizMockup() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-16 rounded bg-primary/20" />
      <div className="rounded-lg border border-border bg-surface p-2">
        <div className="mb-1.5 text-[8px] font-medium text-text-primary">
          Q1: What is the time complexity of binary search?
        </div>
        <div className="space-y-1">
          {["O(n)", "O(log n)", "O(n²)", "O(1)"].map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[7px] ${
                i === 1
                  ? "border-success bg-green-50 text-success"
                  : "border-border bg-white text-text-secondary"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full border ${
                  i === 1 ? "border-success bg-success" : "border-border"
                }`}
              />
              {opt}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[8px] text-success">
          <span className="font-medium">Correct!</span> O(log n)
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReduced = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (prefersReduced || isPaused) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next, isPaused, prefersReduced]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-primary/8 blur-3xl" />

      {/* Carousel container */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 220 }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: DURATION.carousel / 1000, ease: EASE.inOut },
              opacity: { duration: DURATION.carousel / 1200 },
              scale: { duration: DURATION.carousel / 1200 },
            }}
            className="w-full"
          >
            <div className="px-2">
              <MiniUIMockup type={slides[current].mockup} />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-text-primary">
              {slides[current].title}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 rounded-full border border-border bg-white p-1.5 shadow-card transition-all hover:shadow-overlay"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 text-text-primary" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 rounded-full border border-border bg-white p-1.5 shadow-card transition-all hover:shadow-overlay"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 text-text-primary" />
      </button>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-primary"
                : "w-2 bg-border hover:bg-text-secondary"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
