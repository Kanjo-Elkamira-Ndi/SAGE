import { describe, expect, it } from 'vitest';
import {
  computeRiskScore,
  engagementFromDaysSinceLast,
  normalizeDecline,
  performanceLevelProxy,
  riskLevelFromScore,
  explainRisk,
  riskReasons,
  clamp01,
} from './risk';

describe('clamp01', () => {
  it('clamps to [0,1] and treats NaN as 0', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(NaN)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
  });
});

describe('normalizeDecline', () => {
  it('returns 0 when there is no previous value', () => {
    expect(normalizeDecline(null, 80)).toBe(0);
    expect(normalizeDecline(undefined, 80)).toBe(0);
  });

  it('returns 0 when performance improved or held', () => {
    expect(normalizeDecline(60, 80)).toBe(0);
    expect(normalizeDecline(80, 80)).toBe(0);
  });

  it('returns the relative drop when performance declined', () => {
    expect(normalizeDecline(80, 60)).toBeCloseTo(0.25);
    expect(normalizeDecline(100, 50)).toBeCloseTo(0.5);
  });

  it('clamps the relative drop to 0..1', () => {
    expect(normalizeDecline(10, 0)).toBeCloseTo(1);
  });
});

describe('performanceLevelProxy', () => {
  it('maps a high score to low risk and a low score to high risk', () => {
    expect(performanceLevelProxy(90)).toBeCloseTo(0.1);
    expect(performanceLevelProxy(50)).toBeCloseTo(0.5);
    expect(performanceLevelProxy(0)).toBeCloseTo(1);
  });
});

describe('engagementFromDaysSinceLast', () => {
  it('0 for active today / unknown', () => {
    expect(engagementFromDaysSinceLast(null)).toBe(0);
    expect(engagementFromDaysSinceLast(0)).toBe(0);
    expect(engagementFromDaysSinceLast(1)).toBeCloseTo(1 / 30);
  });

  it('caps at 1 after 30 days', () => {
    expect(engagementFromDaysSinceLast(30)).toBeCloseTo(1);
    expect(engagementFromDaysSinceLast(90)).toBeCloseTo(1);
  });
});

describe('computeRiskScore & level', () => {
  it('low risk for healthy factors', () => {
    const score = computeRiskScore({
      gpaDecline: 0,
      missedSubmissionRate: 0,
      quizDecline: 0,
      lowEngagement: 0,
    });
    expect(score).toBe(0);
    expect(riskLevelFromScore(score)).toBe('low');
  });

  it('high risk for worst factors', () => {
    const score = computeRiskScore({
      gpaDecline: 1,
      missedSubmissionRate: 1,
      quizDecline: 1,
      lowEngagement: 1,
    });
    expect(score).toBe(1);
    expect(riskLevelFromScore(score)).toBe('high');
  });

  it('respects documented weights (0.27 falls below the 0.33 medium band)', () => {
    const score = computeRiskScore({
      gpaDecline: 0.4,
      missedSubmissionRate: 0.2,
      quizDecline: 0.2,
      lowEngagement: 0.2,
    });
    // 0.35*.4 + 0.25*.2 + 0.25*.2 + 0.15*.2 = 0.27
    expect(score).toBeCloseTo(0.27);
    expect(riskLevelFromScore(score)).toBe('low');
  });
});

describe('explainRisk + riskReasons', () => {
  it('returns a breakdown with score/level and human reasons', () => {
    const breakdown = explainRisk({
      gpaDecline: 0.6,
      missedSubmissionRate: 0.5,
      quizDecline: 0.1,
      lowEngagement: 0,
    });
    expect(breakdown.score).toBeCloseTo(0.35 * 0.6 + 0.25 * 0.5 + 0.25 * 0.1);
    expect(breakdown.level).toBe('medium');
    const reasons = riskReasons(breakdown);
    expect(reasons.some((r) => r.includes('GPA'))).toBe(true);
    expect(reasons.some((r) => r.includes('Missed'))).toBe(true);
  });
});
