import { describe, expect, it } from 'vitest';
import { escapeCell, stringifyValue, toCsv } from './csv';

describe('escapeCell', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCell('simple')).toBe('simple');
    expect(escapeCell(42)).toBe('42');
    expect(escapeCell(null)).toBe('');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCell('line\nbreak')).toBe('"line\nbreak"');
  });
});

describe('toCsv', () => {
  it('emits header + rows', () => {
    const csv = toCsv([
      { name: 'Alice', score: 90 },
      { name: 'Bob, Jr.', score: 75 },
    ]);
    expect(csv).toBe('name,score\nAlice,90\n"Bob, Jr.",75');
  });

  it('returns empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });
});

describe('stringifyValue', () => {
  it('serializes dates, objects and nulls', () => {
    expect(stringifyValue(new Date('2026-08-06T00:00:00Z'))).toBe('2026-08-06T00:00:00.000Z');
    expect(stringifyValue({ a: 1 })).toBe('{"a":1}');
    expect(stringifyValue(null)).toBe('');
  });
});
