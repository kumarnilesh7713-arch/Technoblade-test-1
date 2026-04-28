export type Units = "metric" | "imperial";

export function formatDistance(meters: number, units: Units): string {
  if (units === "imperial") {
    const miles = meters / 1609.344;
    return miles.toFixed(2);
  }
  const km = meters / 1000;
  return km.toFixed(2);
}

export function distanceUnitLabel(units: Units): string {
  return units === "imperial" ? "mi" : "km";
}

export function formatPace(secondsPerKm: number, units: Units): string {
  if (!isFinite(secondsPerKm) || secondsPerKm <= 0) return "--'--";
  const secondsPerUnit =
    units === "imperial" ? secondsPerKm * 1.609344 : secondsPerKm;
  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.floor(secondsPerUnit % 60);
  return `${m}'${s.toString().padStart(2, "0")}`;
}

export function paceUnitLabel(units: Units): string {
  return units === "imperial" ? "/mi" : "/km";
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  }
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function formatShortDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function startOfDay(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfWeek(ts: number = Date.now()): number {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfMonth(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function weekLabel(ts: number): string {
  const start = new Date(startOfWeek(ts));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(
    undefined,
    sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
  );
  return `${startLabel} – ${endLabel}`;
}
