// Converts between HTML date inputs and instants, pinned to Asia/Bangkok (UTC+7, no DST)
// so campaign windows match Thai calendar days regardless of server/browser timezone.

const OFFSET = "+07:00";

function parts(d: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
}

/** Date → "YYYY-MM-DD" (Bangkok day) for <input type="date">. */
export function toBangkokDateInput(d: Date): string {
  const p = parts(d);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Date → "YYYY-MM-DDTHH:mm" (Bangkok wall clock) for <input type="datetime-local">. */
export function toBangkokDateTimeInput(d: Date): string {
  const p = parts(d);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** "YYYY-MM-DD" → ISO string at Bangkok midnight. */
export function bangkokDateToIso(value: string): string {
  return new Date(`${value}T00:00:00${OFFSET}`).toISOString();
}

/** "YYYY-MM-DDTHH:mm" → ISO string interpreted as Bangkok wall clock. */
export function bangkokDateTimeToIso(value: string): string {
  return new Date(`${value}:00${OFFSET}`).toISOString();
}
