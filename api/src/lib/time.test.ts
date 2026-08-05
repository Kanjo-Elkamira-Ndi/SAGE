import { describe, expect, it } from 'vitest';
import { parseDurationToMs, parseDurationToSeconds } from './time';

describe('parseDurationToSeconds', () => {
  it('parses common units', () => {
    expect(parseDurationToSeconds('15m')).toBe(900);
    expect(parseDurationToSeconds('2h')).toBe(7200);
    expect(parseDurationToSeconds('30d')).toBe(2_592_000);
    expect(parseDurationToSeconds('90s')).toBe(90);
  });

  it('defaults to seconds when no unit is given', () => {
    expect(parseDurationToSeconds('10')).toBe(10);
  });

  it('throws on invalid input', () => {
    expect(() => parseDurationToSeconds('soon')).toThrow();
    expect(() => parseDurationToSeconds('')).toThrow();
  });

  it('converts to milliseconds via parseDurationToMs', () => {
    expect(parseDurationToMs('1d')).toBe(86_400_000);
  });
});
