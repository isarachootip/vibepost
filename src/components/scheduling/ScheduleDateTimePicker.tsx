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
  red: "text-red-600",
  purple: "text-purple-700",
  blue: "text-blue-600",
  orange: "text-orange-600",
};

const ACCENT_BANNER: Record<ScheduleAccentColor, string> = {
  red: "bg-white border-slate-100 text-slate-600",
  purple: "bg-purple-50/70 border-purple-100 text-purple-800",
  blue: "bg-white border-slate-100 text-slate-600",
  orange: "bg-orange-50/60 border-orange-100 text-slate-700",
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

  const heightCls = compact ? "h-10 text-xs border" : "h-11 sm:h-12 text-sm border-2";

  return (
    <div className="space-y-3">
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-2" : "flex flex-col md:flex-row gap-3"}>
        <div className="flex-1">
          {showLabels && (
            <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
              {dateLabel}
            </label>
          )}
          <Popover>
            <PopoverTrigger
              className={`w-full justify-start text-left font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 inline-flex items-center rounded-xl transition-colors px-3.5 ${heightCls}`}
            >
              <CalendarIcon className="mr-2.5 h-4 w-4 text-slate-400 shrink-0" />
              {format(date, "d MMM yyyy", { locale: th })}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-slate-200 text-slate-800 shadow-xl rounded-2xl">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: minSelectableDate }}
                className="bg-white text-slate-800 rounded-2xl"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className={compact ? "" : "md:w-52"}>
          {showLabels && (
            <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
              {timeLabel}
            </label>
          )}
          <div className={`flex items-center gap-1.5 bg-white border-slate-200 rounded-xl px-3 ${heightCls}`}>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              aria-label="ชั่วโมงที่ตั้งโพสต์"
              value={scheduleHour}
              onChange={(e) => setScheduleHour(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none flex-1 disabled:text-slate-300"
            >
              {HOUR_SLOTS.map((h) => {
                const disabled = isHourOptionDisabled(h);
                return (
                  <option key={h} value={h} disabled={disabled}>
                    {h}
                  </option>
                );
              })}
            </select>
            <span className="text-slate-400 font-bold">:</span>
            <select
              aria-label="นาทีที่ตั้งโพสต์"
              value={scheduleMinute}
              onChange={(e) => setScheduleMinute(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none flex-1 disabled:text-slate-300"
            >
              {MINUTE_SLOTS.map((m) => {
                const disabled = isMinuteOptionDisabled(m);
                return (
                  <option key={m} value={m} disabled={disabled}>
                    {m}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className={`text-xs border rounded-xl px-3.5 py-2.5 font-medium ${ACCENT_BANNER[accentColor]}`}>
          📌 จะโพสต์วันที่{" "}
          <span className="font-bold text-slate-800">
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
