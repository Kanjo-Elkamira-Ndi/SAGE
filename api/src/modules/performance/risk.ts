/**
 * Pure, deterministic risk-scoring logic for student performance tracking.
 *
 * Weights and thresholds mirror the rule-based model documented in
 * `docs/workflows.md` (Section 6). Everything here is pure functions so it is
 * trivially unit-testable and explainable — if a lecturer asks "why is this
 * student flagged", the answer is a breakdown of the four factors below.
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskFactors {
  /** Decline in GPA vs previous snapshot, normalized 0..1. 0 = no decline. */
  gpaDecline: number;
  /** Fraction of assigned submissions never turned in (0..1). */
  missedSubmissionRate: number;
  /** Decline in average quiz score vs previous snapshot, normalized 0..1. 0 = no decline. */
  quizDecline: number;
  /** Low-engagement signal, normalized 0..1. Higher = more disengaged. */
  lowEngagement: number;
}

export interface RiskBreakdown extends RiskFactors {
  score: number;
  level: RiskLevel;
}

export const RISK_WEIGHTS = {
  gpaDecline: 0.35,
  missedSubmissionRate: 0.25,
  quizDecline: 0.25,
  lowEngagement: 0.15,
} as const;

/** Thresholds (inclusive on the higher bound of the next band). */
export const RISK_THRESHOLDS = {
  high: 0.66,
  medium: 0.33,
} as const;

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Normalizes a downward trend between a previous and current value into 0..1.
 * - If either value is null/undefined → 0 (no trend available).
 * - If performance improved or held → 0 (no decline).
 * - Otherwise returns the relative drop, clamped to 0..1.
 */
export function normalizeDecline(prev: number | null | undefined, curr: number | null | undefined): number {
  if (prev == null || curr == null) return 0;
  if (prev <= 0) return curr < 0 ? 0 : 0; // cannot compute a meaningful relative drop
  return clamp01((prev - curr) / prev);
}

/**
 * When there is no previous snapshot, the absolute current performance level is
 * used as a soft proxy: a student starting below a healthy baseline is treated
 * as partially at risk. `pct` is expected in 0..100.
 */
export function performanceLevelProxy(pct: number): number {
  return clamp01((100 - pct) / 100);
}

/** Converts "days since last activity" into a 0..1 disengagement factor. */
export function engagementFromDaysSinceLast(days: number | null | undefined): number {
  if (days == null || days <= 0) return 0; // active today
  if (days >= 30) return 1; // a month dormant → full weight
  return clamp01(days / 30);
}

/**
 * The core weighted score.
 */
export function computeRiskScore(factors: RiskFactors): number {
  const weighted =
    RISK_WEIGHTS.gpaDecline * clamp01(factors.gpaDecline) +
    RISK_WEIGHTS.missedSubmissionRate * clamp01(factors.missedSubmissionRate) +
    RISK_WEIGHTS.quizDecline * clamp01(factors.quizDecline) +
    RISK_WEIGHTS.lowEngagement * clamp01(factors.lowEngagement);
  return clamp01(weighted);
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.high) return 'high';
  if (score >= RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}

export function explainRisk(factors: RiskFactors): RiskBreakdown {
  const score = computeRiskScore(factors);
  return {
    gpaDecline: clamp01(factors.gpaDecline),
    missedSubmissionRate: clamp01(factors.missedSubmissionRate),
    quizDecline: clamp01(factors.quizDecline),
    lowEngagement: clamp01(factors.lowEngagement),
    score,
    level: riskLevelFromScore(score),
  };
}

/** Human-readable reason string for the highest contributing factor. */
export function riskReasons(breakdown: RiskBreakdown): string[] {
  const reasons: string[] = [];
  const entries: Array<[string, number]> = [
    ['GPA declined since the previous snapshot', breakdown.gpaDecline],
    [`Missed ${Math.round(breakdown.missedSubmissionRate * 100)}% of assignment submissions`, breakdown.missedSubmissionRate],
    ['Quiz score declined since the previous snapshot', breakdown.quizDecline],
    ['Low recent engagement (no course activity in over two weeks)', breakdown.lowEngagement],
  ];
  for (const [label, value] of entries) {
    if (value >= RISK_THRESHOLDS.medium) {
      reasons.push(label);
    }
  }
  if (reasons.length === 0) {
    reasons.push('Overall academic standing is healthy.');
  }
  return reasons;
}
