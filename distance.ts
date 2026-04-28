export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  timestamp: number;
};

const R = 6371000;

export function haversine(a: GeoPoint, b: GeoPoint): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function totalDistance(points: GeoPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversine(points[i - 1]!, points[i]!);
  }
  return total;
}

export function elevationGain(points: GeoPoint[]): number {
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!.altitude ?? 0;
    const b = points[i]!.altitude ?? 0;
    const diff = b - a;
    if (diff > 0) gain += diff;
  }
  return gain;
}

export type Split = {
  index: number;
  distanceMeters: number;
  durationSeconds: number;
  pace: number;
};

export function computeSplits(
  points: GeoPoint[],
  splitMeters = 1000,
): Split[] {
  if (points.length < 2) return [];
  const splits: Split[] = [];
  let cumulative = 0;
  let lastSplitDistance = 0;
  let lastSplitTime = points[0]!.timestamp;
  for (let i = 1; i < points.length; i++) {
    cumulative += haversine(points[i - 1]!, points[i]!);
    while (cumulative - lastSplitDistance >= splitMeters) {
      const t = points[i]!.timestamp;
      const ratio =
        (lastSplitDistance + splitMeters - (cumulative - haversine(points[i - 1]!, points[i]!))) /
        Math.max(1, haversine(points[i - 1]!, points[i]!));
      const splitTime =
        points[i - 1]!.timestamp + ratio * (t - points[i - 1]!.timestamp);
      const dur = (splitTime - lastSplitTime) / 1000;
      const pace = dur > 0 ? dur / (splitMeters / 1000) : 0;
      splits.push({
        index: splits.length + 1,
        distanceMeters: splitMeters,
        durationSeconds: dur,
        pace,
      });
      lastSplitDistance += splitMeters;
      lastSplitTime = splitTime;
    }
  }
  const remaining = cumulative - lastSplitDistance;
  if (remaining > 50) {
    const dur = (points[points.length - 1]!.timestamp - lastSplitTime) / 1000;
    const pace = dur > 0 ? dur / (remaining / 1000) : 0;
    splits.push({
      index: splits.length + 1,
      distanceMeters: remaining,
      durationSeconds: dur,
      pace,
    });
  }
  return splits;
}

export function caloriesEstimate(
  activityType: string,
  distanceMeters: number,
  durationSeconds: number,
  weightKg = 70,
): number {
  const hours = durationSeconds / 3600;
  const mets =
    activityType === "cycle"
      ? 7.5
      : activityType === "walk"
        ? 3.8
        : 9.8;
  const fromMets = mets * weightKg * hours;
  if (fromMets > 0) return Math.round(fromMets);
  const km = distanceMeters / 1000;
  const factor =
    activityType === "cycle" ? 30 : activityType === "walk" ? 50 : 65;
  return Math.round(km * factor);
}
