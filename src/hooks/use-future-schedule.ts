"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { MinuteSlot } from "@/lib/validations/post-schedule.schema";
import {
  clampSelectionToFuture,
  combineDateAndTime,
  getMinSelectableDate,
  getSuggestedScheduleSlot,
  isHourDisabled,
  isMinuteDisabled,
} from "@/lib/services/schedule-time.service";

export interface FutureScheduleState {
  date: Date;
  scheduleHour: string;
  scheduleMinute: MinuteSlot;
  minSelectableDate: Date;
  setDate: (nextDate: Date | undefined) => void;
  setScheduleHour: (nextHour: string) => void;
  setScheduleMinute: (nextMinute: string) => void;
  isHourOptionDisabled: (hour: string) => boolean;
  isMinuteOptionDisabled: (minute: string) => boolean;
  getScheduledDate: () => Date;
  resetSchedule: () => void;
}

interface InternalSelection {
  date: Date;
  scheduleHour: string;
  scheduleMinute: MinuteSlot;
}

function createInitialSelection(now: Date = new Date()): InternalSelection {
  const suggested = getSuggestedScheduleSlot(now);
  return {
    date: suggested.date,
    scheduleHour: suggested.hour,
    scheduleMinute: suggested.minute,
  };
}

export function useFutureSchedule(): FutureScheduleState {
  const [now, setNow] = useState<Date>(() => new Date());
  const [selection, setSelection] = useState<InternalSelection>(() =>
    createInitialSelection(new Date())
  );

  // Periodically advance clock and clamp if selected slot drifted into the past
  useEffect(() => {
    const timer = setInterval(() => {
      const tickNow = new Date();
      setNow(tickNow);
      setSelection((prev) => {
        const clamped = clampSelectionToFuture(
          prev.date,
          prev.scheduleHour,
          prev.scheduleMinute,
          tickNow
        );
        if (!clamped.adjusted) return prev;
        return {
          date: clamped.date,
          scheduleHour: clamped.hour,
          scheduleMinute: clamped.minute,
        };
      });
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  const setDate = useCallback((nextDate: Date | undefined) => {
    const freshNow = new Date();
    setNow(freshNow);
    setSelection((prev) => {
      const targetDate = nextDate ?? prev.date;
      const clamped = clampSelectionToFuture(
        targetDate,
        prev.scheduleHour,
        prev.scheduleMinute,
        freshNow
      );
      return {
        date: clamped.date,
        scheduleHour: clamped.hour,
        scheduleMinute: clamped.minute,
      };
    });
  }, []);

  const setScheduleHour = useCallback((nextHour: string) => {
    const freshNow = new Date();
    setNow(freshNow);
    setSelection((prev) => {
      const clamped = clampSelectionToFuture(
        prev.date,
        nextHour,
        prev.scheduleMinute,
        freshNow
      );
      return {
        date: clamped.date,
        scheduleHour: clamped.hour,
        scheduleMinute: clamped.minute,
      };
    });
  }, []);

  const setScheduleMinute = useCallback((nextMinute: string) => {
    const freshNow = new Date();
    setNow(freshNow);
    setSelection((prev) => {
      const clamped = clampSelectionToFuture(
        prev.date,
        prev.scheduleHour,
        nextMinute,
        freshNow
      );
      return {
        date: clamped.date,
        scheduleHour: clamped.hour,
        scheduleMinute: clamped.minute,
      };
    });
  }, []);

  const resetSchedule = useCallback(() => {
    const freshNow = new Date();
    setNow(freshNow);
    setSelection(createInitialSelection(freshNow));
  }, []);

  const minSelectableDate = useMemo(() => getMinSelectableDate(now), [now]);

  const isHourOptionDisabled = useCallback(
    (hour: string) => isHourDisabled(selection.date, hour, now),
    [selection.date, now]
  );

  const isMinuteOptionDisabled = useCallback(
    (minute: string) =>
      isMinuteDisabled(selection.date, selection.scheduleHour, minute, now),
    [selection.date, selection.scheduleHour, now]
  );

  const getScheduledDate = useCallback(
    () =>
      combineDateAndTime(
        selection.date,
        selection.scheduleHour,
        selection.scheduleMinute
      ),
    [selection.date, selection.scheduleHour, selection.scheduleMinute]
  );

  return {
    date: selection.date,
    scheduleHour: selection.scheduleHour,
    scheduleMinute: selection.scheduleMinute,
    minSelectableDate,
    setDate,
    setScheduleHour,
    setScheduleMinute,
    isHourOptionDisabled,
    isMinuteOptionDisabled,
    getScheduledDate,
    resetSchedule,
  };
}
