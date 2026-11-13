"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { HOUR_SLOTS, MINUTE_SLOTS } from "@/lib/services/schedule-time.service";
import type { FutureScheduleState } from "@/hooks/use-future-schedule";

export type ScheduleAccentColor = "red" | "purple" | "blue" | "orange";

interface ScheduleDateTimePickerProps {
  schedule: FutureScheduleState;
  accentColor?: ScheduleAccentColor;
  compact?: boolean;
  showLabels?: boolean;
  showPreview?: boolean;
  dateLabel?: string;
  timeLabel?: string;
}

const ACCENT_TEXT: Record<ScheduleAccentColor, string> = {
  red: "text-destructive dark:text-rose-400",
  purple: "text-primary",
  blue: "text-sky-600 dark:text-sky-400",
  orange: "text-amber-600 dark:text-amber-400",
};

const ACCENT_BANNER: Record<ScheduleAccentColor, string> = {
  red: "bg-[var(--surface-recessed)] border-border/60 text-muted-foreground",
  purple: "bg-primary/10 border-primary/25 text-foreground/90",
  blue: "bg-[var(--surface-recessed)] border-border/60 text-muted-foreground",
  orange: "bg-amber-500/10 border-amber-500/25 text-foreground/90",
};

export function ScheduleDateTimePicker({
  schedule,
  accentColor = "red",
  compact = false,
  showLabels = true,
  showPreview = true,
  dateLabel = "📆 วันที่",
  timeLabel = "🕐 เวลา",
}: ScheduleDateTimePickerProps) {
  const {
    date,
    scheduleHour,
    scheduleMinute,
    minSelectableDate,
    setDate,
    setScheduleHour,
    setScheduleMinute,
    isHourOptionDisabled,
    isMinuteOptionDisabled,
  } = schedule;

  const heightCls = compact ? "h-10 text-xs border" : "h-11 sm:h-12 text-sm border";

  return (
    <div className="space-y-3">
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-2" : "flex flex-col md:flex-row gap-3"}>
        <div className="flex-1">
          {showLabels && (
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">
              {dateLabel}
            </label>
          )}
          <Popover>
            <PopoverTrigger
              className={`w-full justify-start text-left font-semibold neu-pressed bg-[var(--surface-recessed)] border-border/70 text-foreground hover:bg-[var(--surface-elevated)] inline-flex items-center rounded-xl transition-colors px-3.5 ${heightCls}`}
            >
              <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground shrink-0" />
              {format(date, "d MMM yyyy", { locale: th })}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: minSelectableDate }}
                className="bg-transparent text-foreground rounded-2xl"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className={compact ? "" : "md:w-52"}>
          {showLabels && (
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">
              {timeLabel}
            </label>
          )}
          <div
            className={`flex items-center gap-1.5 neu-pressed bg-[var(--surface-recessed)] border-border/70 rounded-xl px-3 ${heightCls}`}
          >
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              aria-label="ชั่วโมงที่ตั้งโพสต์"
              value={scheduleHour}
              onChange={(e) => setScheduleHour(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none flex-1 disabled:opacity-40 [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
            >
              {HOUR_SLOTS.map((h) => (
                <option key={h} value={h} disabled={isHourOptionDisabled(h)}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground font-bold">:</span>
            <select
              aria-label="นาทีที่ตั้งโพสต์"
              value={scheduleMinute}
              onChange={(e) => setScheduleMinute(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none flex-1 disabled:opacity-40 [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
            >
              {MINUTE_SLOTS.map((m) => (
                <option key={m} value={m} disabled={isMinuteOptionDisabled(m)}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className={`text-xs border rounded-xl px-3.5 py-2.5 font-medium ${ACCENT_BANNER[accentColor]}`}>
          📌 จะโพสต์วันที่{" "}
          <span className="font-bold text-foreground">
            {format(date, "EEEE d MMMM yyyy", { locale: th })}
          </span>{" "}
          เวลา{" "}
          <span className={`font-black ${ACCENT_TEXT[accentColor]}`}>
            {scheduleHour}:{scheduleMinute} น.
          </span>
        </div>
      )}
    </div>
  );
}
