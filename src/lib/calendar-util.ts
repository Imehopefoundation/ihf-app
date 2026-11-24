/** Pure date helpers for the calendar (no framework/server deps). */

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface MonthRange {
  year: number;
  month: number; // 1–12
  start: string; // YYYY-MM-01
  end: string; // YYYY-MM-last
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse a ?m=YYYY-MM param (or default to the current month). */
export function monthRange(m?: string | null, now: Date = new Date()): MonthRange {
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1;
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split("-").map(Number);
    if (mo >= 1 && mo <= 12) {
      year = y;
      month = mo;
    }
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    year,
    month,
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

export function monthParam(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function shiftMonth(year: number, month: number, delta: number): string {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return monthParam(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

/** "14:30:00" → "2:30 pm". null-safe. */
export function formatTime(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  const ampm = h < 12 ? "am" : "pm";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${pad(m)} ${ampm}`;
}

export function todayISO(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
}
