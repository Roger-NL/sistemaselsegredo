import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { LiveClassSlot } from "@/contracts/live-class";

export const LIVE_CLASS_DURATION = 60;
export function monthKey(now: Date, timezone: string) { return formatInTimeZone(now, timezone, "yyyy-MM"); }
export function offsetMonth(month: string, offset: number) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7);
}
export function calendarDays(month: string) {
  const [year, number] = month.split("-").map(Number);
  return Array.from({ length: new Date(Date.UTC(year, number, 0)).getUTCDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}
export function monthSlots(month: string, timezone: string, now = new Date()): LiveClassSlot[] {
  const result: LiveClassSlot[] = [];
  for (const day of calendarDays(month)) for (let hour = 0; hour < 24; hour++) {
    const time = `${String(hour).padStart(2, "0")}:00`;
    const start = fromZonedTime(`${day}T${time}:00`, timezone);
    // Skip nonexistent local hours on the daylight-saving transition.
    if (start <= now || formatInTimeZone(start, timezone, "yyyy-MM-dd HH:mm") !== `${day} ${time}`) continue;
    result.push({ start: start.toISOString(), end: new Date(start.getTime() + LIVE_CLASS_DURATION * 60_000).toISOString(), day, time });
  }
  return result;
}
