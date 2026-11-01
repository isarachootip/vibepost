import assert from "node:assert/strict";
import {
  getSuggestedScheduleSlot,
  getMinSelectableDate,
  isHourDisabled,
  isMinuteDisabled,
  clampSelectionToFuture,
  validateScheduledTime,
  combineDateAndTime,
} from "../src/lib/services/schedule-time.service";
import { createScheduledPostInputSchema } from "../src/lib/validations/post-schedule.schema";

export async function runScheduleTimeTests(): Promise<void> {
  // 1. Suggested slot at 12:14:21 -> 12:30 today
  {
    const now = new Date(2026, 10, 1, 12, 14, 21); // Nov 1, 2026 12:14:21
    const slot = getSuggestedScheduleSlot(now);
    assert.equal(slot.hour, "12");
    assert.equal(slot.minute, "30");
    assert.equal(slot.date.getFullYear(), 2026);
    assert.equal(slot.date.getMonth(), 10);
    assert.equal(slot.date.getDate(), 1);
    assert.ok(slot.scheduledAt.getTime() > now.getTime());
  }

  // 2. Suggested slot at 12:00:05 -> 12:30 (since 12:15 is < 15 full minutes away)
  {
    const now = new Date(2026, 10, 1, 12, 0, 5);
    const slot = getSuggestedScheduleSlot(now);
    assert.equal(slot.hour, "12");
    assert.equal(slot.minute, "30");
  }

  // 3. Suggested slot at exact 12:00:00.000 -> 12:15
  {
    const now = new Date(2026, 10, 1, 12, 0, 0, 0);
    const slot = getSuggestedScheduleSlot(now);
    assert.equal(slot.hour, "12");
    assert.equal(slot.minute, "15");
  }

  // 4. Suggested slot rolling over the hour (12:46:10 -> 13:15)
  {
    const now = new Date(2026, 10, 1, 12, 46, 10);
    const slot = getSuggestedScheduleSlot(now);
    assert.equal(slot.hour, "13");
    assert.equal(slot.minute, "15");
    assert.equal(slot.date.getDate(), 1);
  }

  // 5. Suggested slot rolling over midnight (23:50:00 -> Nov 2, 00:15)
  {
    const now = new Date(2026, 10, 1, 23, 50, 0);
    const slot = getSuggestedScheduleSlot(now);
    assert.equal(slot.date.getFullYear(), 2026);
    assert.equal(slot.date.getMonth(), 10);
    assert.equal(slot.date.getDate(), 2);
    assert.equal(slot.hour, "00");
    assert.equal(slot.minute, "15");
  }

  // 6. Min selectable calendar date: keeps today selectable when future slots exist, advances after 23:45
  {
    const midday = new Date(2026, 10, 1, 20, 10, 0);
    const minToday = getMinSelectableDate(midday);
    assert.equal(minToday.getDate(), 1);
    assert.equal(minToday.getHours(), 0);

    const lateNight = new Date(2026, 10, 1, 23, 46, 0);
    const minTomorrow = getMinSelectableDate(lateNight);
    assert.equal(minTomorrow.getDate(), 2);
    assert.equal(minTomorrow.getHours(), 0);
  }

  // 7. Disabled hours & minutes on today vs tomorrow
  {
    const now = new Date(2026, 10, 1, 12, 14, 21);
    const today = new Date(2026, 10, 1);
    const tomorrow = new Date(2026, 10, 2);

    assert.equal(isHourDisabled(today, "11", now), true);
    assert.equal(isHourDisabled(today, "12", now), false);
    assert.equal(isMinuteDisabled(today, "12", "00", now), true);
    assert.equal(isMinuteDisabled(today, "12", "15", now), false);
    assert.equal(isMinuteDisabled(today, "12", "30", now), false);

    // At 12:45:00, hour 12 has no future 15-min slots left
    const at1245 = new Date(2026, 10, 1, 12, 45, 0);
    assert.equal(isHourDisabled(today, "12", at1245), true);

    // Tomorrow allows 00:00
    assert.equal(isHourDisabled(tomorrow, "00", now), false);
    assert.equal(isMinuteDisabled(tomorrow, "00", "00", now), false);
  }

  // 8. Clamp selection when switching back to today with a past hour/minute
  {
    const now = new Date(2026, 10, 1, 12, 14, 21);
    const today = new Date(2026, 10, 1);

    const clampedFromMorning = clampSelectionToFuture(today, "09", "00", now);
    assert.equal(clampedFromMorning.adjusted, true);
    const combined1 = combineDateAndTime(
      clampedFromMorning.date,
      clampedFromMorning.hour,
      clampedFromMorning.minute
    );
    assert.ok(combined1.getTime() > now.getTime());

    // Same hour 12, past minute 00 -> clamps to a valid future minute in hour 12
    const clampedSameHour = clampSelectionToFuture(today, "12", "00", now);
    assert.equal(clampedSameHour.adjusted, true);
    assert.equal(clampedSameHour.hour, "12");
    assert.notEqual(clampedSameHour.minute, "00");
  }

  // 9. Server-side validateScheduledTime blocks past times in SCHEDULE mode, allows NOW mode
  {
    const now = new Date(2026, 10, 1, 12, 14, 21);
    const pastTime = new Date(2026, 10, 1, 12, 0, 0);
    const futureTime = new Date(2026, 10, 1, 12, 30, 0);

    const pastCheck = validateScheduledTime(pastTime, "SCHEDULE", now);
    assert.equal(pastCheck.valid, false);

    const equalCheck = validateScheduledTime(now, "SCHEDULE", now);
    assert.equal(equalCheck.valid, false);

    const futureCheck = validateScheduledTime(futureTime, "SCHEDULE", now);
    assert.equal(futureCheck.valid, true);
    if (futureCheck.valid) {
      assert.equal(futureCheck.isPostNow, false);
      assert.equal(futureCheck.finalTime.getTime(), futureTime.getTime());
    }

    const nowCheck = validateScheduledTime(null, "NOW", now);
    assert.equal(nowCheck.valid, true);
    if (nowCheck.valid) {
      assert.equal(nowCheck.isPostNow, true);
    }
  }

  // 10. Zod schema boundary check
  {
    const bad = createScheduledPostInputSchema.safeParse({
      content: "   ",
      scheduledTime: new Date(),
      targetConnectionIds: [],
      publishMode: "SCHEDULE",
    });
    assert.equal(bad.success, false);

    const good = createScheduledPostInputSchema.safeParse({
      content: "เที่ยวปากน้ำ สมุทรปราการ",
      scheduledTime: new Date(2026, 10, 1, 13, 0, 0),
      targetConnectionIds: ["conn-1"],
      publishMode: "SCHEDULE",
    });
    assert.equal(good.success, true);
  }

  console.log("  ✓ schedule-time.test.ts passed (10 assertions)");
}
