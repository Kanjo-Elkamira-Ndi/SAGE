/** RFC 4180-ish CSV serialization for admin report exports. */
export function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Serializes rows to CSV. The first row's keys are the header; every row must
 * share the same shape. Date values are ISO-8601 strings via toISOString().
 */
export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0] ?? {});
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header])).join(','));
  }
  return lines.join('\n');
}

export function stringifyValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value == null ? '' : String(value);
}
