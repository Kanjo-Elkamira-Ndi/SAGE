import { describe, expect, it } from 'vitest';
import {
  buildRiskFactors,
  buildCourseRiskFactors,
  computeCoursePct,
  todayDateStr,
  atRiskReasons,
} from './performance.service';
import { explainRisk } from './risk';
import type { CourseMetrics, StudentMetrics } from './performance.service';

function metrics(over: Partial<StudentMetrics> = {}): StudentMetrics {
  return {
    gpa: over.gpa ?? null,
    avgAssignmentPct: over.avgAssignmentPct ?? null,
    avgQuizPct: over.avgQuizPct ?? null,
    missedSubmissionRate: over.missedSubmissionRate ?? 0,
    lastActivity: over.lastActivity ?? null,
    byCourse: over.byCourse ?? [],
  };
}

describe('todayDateStr', () => {
  it('returns a YYYY-MM-DD UTC date string', () => {
    const d = new Date('2026-08-05T23:30:00.000Z');
    expect(todayDateStr(d)).toBe('2026-08-05');
  });
});

describe('computeCoursePct', () => {
  it('blends assignment and quiz averages weighted by counts', () => {
    // 2 assignments @80, 3 quizzes @60 → (80*2 + 60*3)/5 = 68
    expect(computeCoursePct(80, 60, 2, 3)).toBe(68);
  });

  it('returns null when both averages are absent', () => {
    expect(computeCoursePct(null, null, 0, 0)).toBeNull();
  });

  it('uses only available component', () => {
    expect(computeCoursePct(70, null, 2, 0)).toBe(70);
    expect(computeCoursePct(null, 90, 0, 2)).toBe(90);
  });
});

describe('buildRiskFactors', () => {
  it('uses a performance-level proxy when there is no prior snapshot', () => {
    const factors = buildRiskFactors(
      metrics({ gpa: 50, avgQuizPct: 50, missedSubmissionRate: 0.5, lastActivity: new Date() }),
      null,
    );
    // gpa proxy = (100-50)/100 = 0.5
    expect(factors.gpaDecline).toBeCloseTo(0.5);
    expect(factors.missedSubmissionRate).toBe(0.5);
    // quiz proxy = (100-50)/100 = 0.5
    expect(factors.quizDecline).toBeCloseTo(0.5);
  });

  it('uses actual decline vs the prior snapshot when available', () => {
    const prev = {
      id: '',
      studentId: '',
      courseId: null,
      snapshotDate: new Date('2026-07-29'),
      gpa: 80,
      avgAssignmentScore: 80,
      avgQuizScore: 80,
      riskScore: null,
      riskLevel: null,
      createdAt: new Date(),
    };
    const factors = buildRiskFactors(
      metrics({ gpa: 60, avgQuizPct: 60, missedSubmissionRate: 0, lastActivity: new Date('2026-08-04') }),
      prev,
    );
    // gpa decline = (80-60)/80 = 0.25 ; quiz decline = (80-60)/80 = 0.25
    expect(factors.gpaDecline).toBeCloseTo(0.25);
    expect(factors.quizDecline).toBeCloseTo(0.25);
    expect(factors.lowEngagement).toBeGreaterThan(0);
  });

  it('gives zero engagement when last activity is older than snapshot window', () => {
    const prev = {
      id: '',
      studentId: '',
      courseId: null,
      snapshotDate: new Date('2026-07-29'),
      gpa: 50,
      avgAssignmentScore: 50,
      avgQuizScore: 50,
      riskScore: null,
      riskLevel: null,
      createdAt: new Date(),
    };
    // lastActivity null → daysSinceActivity 0 → lowEngagement 0
    const factors = buildRiskFactors(metrics({ gpa: 50, avgQuizPct: 50, lastActivity: null }), prev);
    expect(factors.lowEngagement).toBe(0);
  });
});

describe('buildCourseRiskFactors', () => {
  it('returns neutral factors when a course has no grade data', () => {
    const f = buildCourseRiskFactors(null, null);
    expect(f).toEqual({ gpaDecline: 0, missedSubmissionRate: 0, quizDecline: 0, lowEngagement: 0 });
  });

  it('uses level proxy when no prior course snapshot exists', () => {
    const course: CourseMetrics = {
      courseId: 'c1',
      code: 'CS101',
      title: 'Intro',
      creditUnits: 3,
      assignmentCount: 4,
      submittedCount: 4,
      gradedCount: 4,
      missedSubmissionRate: 0,
      avgAssignmentPct: 90,
      avgQuizPct: 90,
      lastAssignmentSubmit: new Date(),
      lastQuizAttempt: new Date(),
      lastActivity: new Date(),
      coursePct: 90,
    };
    const f = buildCourseRiskFactors(course, null);
    expect(f.gpaDecline).toBeCloseTo(0.1); // (100-90)/100
    expect(f.missedSubmissionRate).toBe(0);
  });
});

describe('atRiskReasons', () => {
  it('flags high-risk scores with outreach guidance', () => {
    expect(atRiskReasons(0.9, 'high')).toContain('Risk score is high; immediate outreach recommended.');
  });

  it('flags medium-risk scores for monitoring', () => {
    expect(atRiskReasons(0.45, 'medium')).toContain('Risk score is medium; monitor progress and provide support.');
  });

  it('provides a generic reason when healthy', () => {
    const reasons = atRiskReasons(0.1, 'low');
    expect(reasons).toContain("Review the student's recent activity and grades.");
  });
});

describe('explainRisk integration', () => {
  it('computes a weighted score and maps to a level', () => {
    const b = explainRisk({ gpaDecline: 0.4, missedSubmissionRate: 0.2, quizDecline: 0.2, lowEngagement: 0.2 });
    // 0.35*.4 + 0.25*.2 + 0.25*.2 + 0.15*.2 = 0.27 → below the 0.33 medium band
    expect(b.score).toBeCloseTo(0.27);
    expect(b.level).toBe('low');
  });
});
