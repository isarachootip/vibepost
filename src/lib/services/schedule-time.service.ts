import type { MinuteSlot, PublishMode } from "@/lib/validations/post-schedule.schema";

export const MINUTE_SLOTS: readonly MinuteSlot[] = ["00", "15", "30", "45"] as const;
export const HOUR_SLOTS: readonly string[] = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);

export interface SuggestedScheduleSlot {
  date: Date;
  hour: string;
  minute: MinuteSlot;
  scheduledAt: Date;
}

export type ScheduleValidationResult =
  | { valid: true; isPostNow: boolean; finalTime: Date }
  | { valid: false; error: string };

export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function combineDateAndTime(date: Date, hour: string, minute: string): Date {
  const parsedHour = Number.parseInt(hour, 10) || 0;
  const parsedMinute = Number.parseInt(minute, 10) || 0;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parsedHour,
    parsedMinute,
    0,
    0
  );
}

function toMinuteSlot(minuteNum: number): MinuteSlot {
  const padded = String(minuteNum).padStart(2, "0");
  if (padded === "15" || padded === "30" || padded === "45") {
    return padded;
  }
  return "00";
}

/**
 * Computes a default future schedule slot at least `minBufferMinutes` ahead of `now`,
 * rounded UP to the next 15-minute boundary (:00, :15, :30, :45).
 * Automatically rolls over midnight to the next calendar day.
 */
export function getSuggestedScheduleSlot(
  now: Date = new Date(),
  minBufferMinutes: number = 15
): SuggestedScheduleSlot {
  const target = new Date(now.getTime() + minBufferMinutes * 60_000);
  const exactMinutes =
    target.getMinutes() + target.getSeconds() / 60 + target.getMilliseconds() / 60_000;
  const roundedMinutes = Math.ceil(exactMinutes / 15) * 15;

  const scheduledAt = new Date(target);
  scheduledAt.setMinutes(roundedMinutes, 0, 0);

  return {
    date: getStartOfDay(scheduledAt),
    hour: String(scheduledAt.getHours()).padStart(2, "0"),
    minute: toMinuteSlot(scheduledAt.getMinutes()),
    scheduledAt,
  };
}

/**
 * Returns the earliest calendar day that still has at least one future 15-min slot (> now).
 */
export function getMinSelectableDate(now: Date = new Date()): Date {
  const todayStart = getStartOfDay(now);
  const lastSlotToday = combineDateAndTime(todayStart, "23", "45");
  if (lastSlotToday.getTime() <= now.getTime()) {
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return todayStart;
}

export function isHourDisabled(
  selectedDate: Date | undefined,
  hour: string,
  now: Date = new Date()
): boolean {
  if (!selectedDate) return false;
  const selectedDay = getStartOfDay(selectedDate);
  const todayStart = getStartOfDay(now);

  if (selectedDay.getTime() < todayStart.getTime()) return true;
  if (!isSameCalendarDay(selectedDay, todayStart)) return false;

  // An hour on today is disabled only when its last 15-min slot (:45) has already passed
  const lastMinuteInHour = combineDateAndTime(selectedDay, hour, "45");
  return lastMinuteInHour.getTime() <= now.getTime();
}

export function isMinuteDisabled(
  selectedDate: Date | undefined,
  hour: string,
  minute: string,
  now: Date = new Date()
): boolean {
  if (!selectedDate) return false;
  const selectedDay = getStartOfDay(selectedDate);
  const todayStart = getStartOfDay(now);

  if (selectedDay.getTime() < todayStart.getTime()) return true;
  if (!isSameCalendarDay(selectedDay, todayStart)) return false;

  const candidate = combineDateAndTime(selectedDay, hour, minute);
  return candidate.getTime() <= now.getTime();
}

/**
 * Ensures any user-selected (date, hour, minute) combination never points to the past.
 */
export function clampSelectionToFuture(
  selectedDate: Date | undefined,
  hour: string,
  minute: string,
  now: Date = new Date()
): { date: Date; hour: string; minute: MinuteSlot; adjusted: boolean } {
  const safeMinute = toMinuteSlot(Number.parseInt(minute, 10) || 0);
  if (!selectedDate) {
    const suggested = getSuggestedScheduleSlot(now);
    return { date: suggested.date, hour: suggested.hour, minute: suggested.minute, adjusted: true };
  }

  const candidate = combineDateAndTime(selectedDate, hour, safeMinute);
  if (candidate.getTime() > now.getTime()) {
    return { date: getStartOfDay(selectedDate), hour: hour.padStart(2, "0"), minute: safeMinute, adjusted: false };
  }

  // If the chosen date & hour still has a valid future minute slot today, advance minute within that hour
  if (!isHourDisabled(selectedDate, hour, now)) {
    const suggested = getSuggestedScheduleSlot(now);
    if (isSameCalendarDay(selectedDate, suggested.date) && suggested.hour === hour) {
      return { date: getStartOfDay(selectedDate), hour, minute: suggested.minute, adjusted: true };
    }
    const nextValidMinute = MINUTE_SLOTS.find((m) => !isMinuteDisabled(selectedDate, hour, m, now));
    if (nextValidMinute) {
      return { date: getStartOfDay(selectedDate), hour, minute: nextValidMinute, adjusted: true };
    }
  }

  // Otherwise fall forward to the suggested future slot
  const suggested = getSuggestedScheduleSlot(now);
  return { date: suggested.date, hour: suggested.hour, minute: suggested.minute, adjusted: true };
}

export function validateScheduledTime(
  scheduledTime: Date | null | undefined,
  mode: PublishMode,
  now: Date = new Date()
): ScheduleValidationResult {
  if (mode === "NOW") {
    return { valid: true, isPostNow: true, finalTime: now };
  }
  if (!scheduledTime || Number.isNaN(scheduledTime.getTime())) {
    return { valid: false, error: "กรุณาระบุวันและเวลาที่ต้องการตั้งโพสต์ล่วงหน้า" };
  }
  if (scheduledTime.getTime() <= now.getTime()) {
    return { valid: false, error: "เวลาที่ตั้งโพสต์ต้องมากกว่าเวลาปัจจุบัน กรุณาเลือกเวลาในอนาคต" };
  }
  return { valid: true, isPostNow: false, finalTime: scheduledTime };
}
