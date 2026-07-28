/**
 * SAGE Motion Constants
 * Centralized animation timing and easing for consistent motion language.
 */

// === Durations (ms) ===
export const DURATION = {
  /** Fast micro-interaction (button hover, toggle) */
  fast: 150,
  /** Standard transition (page fade, card hover) */
  normal: 250,
  /** Content entrance (staggered fade-in) */
  entrance: 400,
  /** Hero carousel slide */
  carousel: 600,
  /** Page transition */
  page: 280,
} as const;

// === Easing ===
export const EASE = {
  /** Default ease-out for entrances */
  out: [0.16, 1, 0.3, 1] as const,
  /** In-out for page transitions */
  inOut: [0.45, 0, 0.55, 1] as const,
  /** Spring-like snap for hover effects */
  spring: [0.34, 1.56, 0.64, 1] as const,
} as const;

// === Stagger Delays (ms) ===
export const STAGGER = {
  /** Stagger between sibling elements */
  children: 80,
  /** Stagger for hero text lines */
  hero: 100,
  /** Stagger for feature cards */
  cards: 120,
} as const;

// === Framer Motion Variants ===
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
} as const;

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: STAGGER.children,
    },
  },
} as const;

export const staggerHero = {
  animate: {
    transition: {
      staggerChildren: STAGGER.hero,
    },
  },
} as const;
