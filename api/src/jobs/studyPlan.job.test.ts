import { describe, expect, it } from 'vitest';
import { buildStudyPlanPrompt, sanitizePlan } from './studyPlan.job';

describe('buildStudyPlanPrompt', () => {
  it('includes courses and deadlines', () => {
    const prompt = buildStudyPlanPrompt({
      courses: ['CSC301', 'MTH201'],
      upcomingDeadlines: [
        { title: 'Assignment 3', deadlineAt: new Date('2026-08-10T23:59:00Z') },
      ],
    });
    expect(prompt).toContain('CSC301');
    expect(prompt).toContain('MTH201');
    expect(prompt).toContain('Assignment 3');
    expect(prompt).toContain('2026-08-10');
  });

  it('handles empty context', () => {
    const prompt = buildStudyPlanPrompt({ courses: [], upcomingDeadlines: [] });
    expect(prompt).toContain('none yet');
    expect(prompt).toContain('- none');
  });
});

describe('sanitizePlan', () => {
  it('trims whitespace and caps length', () => {
    const long = ` ${'a'.repeat(5000)} `;
    const plan = sanitizePlan(long);
    expect(plan).toBe('a'.repeat(4000));
  });

  it('passes through a short plan', () => {
    expect(sanitizePlan('  Study chapter 3.  ')).toBe('Study chapter 3.');
  });
});
