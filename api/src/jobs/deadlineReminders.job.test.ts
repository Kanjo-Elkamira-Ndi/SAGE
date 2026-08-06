import { describe, expect, it } from 'vitest';
import { getReminderWindows, humanizeHours } from './deadlineReminders.job';

describe('humanizeHours', () => {
  it('formats single and plural hours', () => {
    expect(humanizeHours(1)).toBe('1 hour');
    expect(humanizeHours(2)).toBe('2 hours');
  });

  it('formats full days', () => {
    expect(humanizeHours(24)).toBe('1 day');
    expect(humanizeHours(48)).toBe('2 days');
  });
});

describe('getReminderWindows', () => {
  it('parses, sorts descending and filters non-positive values', () => {
    expect(getReminderWindows('2,48,24,0,-5')).toEqual([48, 24, 2]);
  });

  it('uses the default source when none is given', () => {
    expect(getReminderWindows()).toEqual([48, 24, 2]);
  });

  it('tolerates spaces and empty segments', () => {
    expect(getReminderWindows(' 24 , , 1 ')).toEqual([24, 1]);
  });
});
