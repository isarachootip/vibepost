import { toBangkokDateInput, bangkokDateToIso } from "./planner/bangkok-time";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface DayWindow {
  dateKey: string;
  start: Date;
  end: Date;
}

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Computes [00:00:00+07:00, next 00:00:00+07:00) for the Bangkok calendar day containing `now`.
 */
export function getBangkokDayRange(now: Date = new Date()): DayWindow {
  const dateKey = toBangkokDateInput(now);
  const start = new Date(bangkokDateToIso(dateKey));
  const end = new Date(start.getTime() + ONE_DAY_MS);
  return { dateKey, start, end };
}

export function evaluateDailyVideoQuota(
  usedToday: number,
  dailyLimit: number
): QuotaCheckResult {
  const safeLimit = Math.max(0, Math.trunc(dailyLimit));
  const safeUsed = Math.max(0, Math.trunc(usedToday));
  const remaining = Math.max(0, safeLimit - safeUsed);
  return {
    allowed: safeUsed < safeLimit,
    used: safeUsed,
    limit: safeLimit,
    remaining,
  };
}
