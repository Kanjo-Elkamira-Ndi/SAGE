const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86_400 };

export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*([smhd])?$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  return Math.round(amount * UNIT_SECONDS[unit]);
}

export function parseDurationToMs(value: string): number {
  return parseDurationToSeconds(value) * 1000;
}
