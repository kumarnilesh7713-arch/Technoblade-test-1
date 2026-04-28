export type WorkoutLevel = "beginner" | "intermediate" | "pro";
export type WorkoutActivity = "run" | "cycle" | "walk";

export type WorkoutStep = {
  label: string;
  detail: string;
  durationSeconds?: number;
  distanceMeters?: number;
  intensity: "easy" | "moderate" | "hard" | "recovery";
};

export type Workout = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  activity: WorkoutActivity;
  level: WorkoutLevel;
  durationMinutes: number;
  distanceMeters: number;
  caloriesEstimate: number;
  tags: string[];
  steps: WorkoutStep[];
};

export const WORKOUT_LIBRARY: Workout[] = [
  {
    id: "easy-3k",
    title: "Easy 3K Jog",
    subtitle: "Conversational pace",
    description:
      "A relaxed run to build aerobic base. Stay below your breathless point — you should be able to hold a conversation.",
    activity: "run",
    level: "beginner",
    durationMinutes: 22,
    distanceMeters: 3000,
    caloriesEstimate: 220,
    tags: ["recovery", "base"],
    steps: [
      { label: "Warmup", detail: "Brisk walk", durationSeconds: 180, intensity: "easy" },
      { label: "Run", detail: "Conversational pace", distanceMeters: 3000, intensity: "easy" },
      { label: "Cooldown", detail: "Walk + stretch", durationSeconds: 240, intensity: "recovery" },
    ],
  },
  {
    id: "walk-30",
    title: "30 Minute Power Walk",
    subtitle: "Brisk neighborhood walk",
    description:
      "A steady, brisk walk to hit your daily active minutes goal. Keep your arms swinging and posture tall.",
    activity: "walk",
    level: "beginner",
    durationMinutes: 30,
    distanceMeters: 2400,
    caloriesEstimate: 140,
    tags: ["everyday", "active"],
    steps: [
      { label: "Warmup", detail: "Easy walk", durationSeconds: 300, intensity: "easy" },
      { label: "Brisk pace", detail: "Steady effort", durationSeconds: 1500, intensity: "moderate" },
      { label: "Cooldown", detail: "Slow walk", durationSeconds: 300, intensity: "recovery" },
    ],
  },
  {
    id: "couch-to-5k-w1",
    title: "Couch to 5K — Week 1",
    subtitle: "Run/walk intervals",
    description:
      "Eight repeats of 60 seconds running and 90 seconds walking. The structure builds capacity without burning you out.",
    activity: "run",
    level: "beginner",
    durationMinutes: 28,
    distanceMeters: 3200,
    caloriesEstimate: 260,
    tags: ["intervals", "structured"],
    steps: [
      { label: "Warmup", detail: "Brisk walk", durationSeconds: 300, intensity: "easy" },
      { label: "Run", detail: "60s × 8", durationSeconds: 60, intensity: "moderate" },
      { label: "Walk", detail: "90s recovery × 8", durationSeconds: 90, intensity: "recovery" },
      { label: "Cooldown", detail: "Walk", durationSeconds: 300, intensity: "recovery" },
    ],
  },
  {
    id: "tempo-5k",
    title: "Tempo 5K",
    subtitle: "Comfortably hard",
    description:
      "Sustained tempo at the edge of comfort. Builds lactate threshold so race pace feels easier.",
    activity: "run",
    level: "intermediate",
    durationMinutes: 30,
    distanceMeters: 5000,
    caloriesEstimate: 360,
    tags: ["tempo", "threshold"],
    steps: [
      { label: "Warmup", detail: "Easy jog", distanceMeters: 1000, intensity: "easy" },
      { label: "Tempo", detail: "Comfortably hard", distanceMeters: 3000, intensity: "hard" },
      { label: "Cooldown", detail: "Easy jog", distanceMeters: 1000, intensity: "recovery" },
    ],
  },
  {
    id: "hill-repeats",
    title: "Hill Repeats",
    subtitle: "6 × 60s climb",
    description:
      "Find a sustained hill and repeat hard climbs with easy jog-back recovery. Builds power and form.",
    activity: "run",
    level: "intermediate",
    durationMinutes: 40,
    distanceMeters: 6500,
    caloriesEstimate: 480,
    tags: ["power", "hills"],
    steps: [
      { label: "Warmup", detail: "Easy jog", distanceMeters: 1500, intensity: "easy" },
      { label: "Hill x6", detail: "60s hard up, jog down", durationSeconds: 60, intensity: "hard" },
      { label: "Cooldown", detail: "Easy jog", distanceMeters: 1500, intensity: "recovery" },
    ],
  },
  {
    id: "long-cycle",
    title: "Endurance Cycle",
    subtitle: "Steady 25K",
    description:
      "A long, steady ride at conversational power. Builds aerobic durability for longer events.",
    activity: "cycle",
    level: "intermediate",
    durationMinutes: 65,
    distanceMeters: 25000,
    caloriesEstimate: 620,
    tags: ["endurance"],
    steps: [
      { label: "Warmup", detail: "Easy spin", durationSeconds: 600, intensity: "easy" },
      { label: "Steady", detail: "Aerobic effort", distanceMeters: 22000, intensity: "moderate" },
      { label: "Cooldown", detail: "Easy spin", durationSeconds: 300, intensity: "recovery" },
    ],
  },
  {
    id: "vo2-intervals",
    title: "VO₂ Max Intervals",
    subtitle: "5 × 3 min",
    description:
      "Five three-minute repeats at near-max effort with full jog recoveries. Lifts your ceiling.",
    activity: "run",
    level: "pro",
    durationMinutes: 50,
    distanceMeters: 9000,
    caloriesEstimate: 680,
    tags: ["vo2", "speed"],
    steps: [
      { label: "Warmup", detail: "Easy jog + strides", distanceMeters: 2000, intensity: "easy" },
      { label: "Interval x5", detail: "3 min hard / 2 min jog", durationSeconds: 180, intensity: "hard" },
      { label: "Cooldown", detail: "Easy jog", distanceMeters: 1500, intensity: "recovery" },
    ],
  },
  {
    id: "long-run",
    title: "Long Slow Distance",
    subtitle: "16K aerobic",
    description:
      "A long, easy effort to build endurance and fat-burning capacity. The cornerstone of every distance plan.",
    activity: "run",
    level: "pro",
    durationMinutes: 90,
    distanceMeters: 16000,
    caloriesEstimate: 1100,
    tags: ["long", "aerobic"],
    steps: [
      { label: "Run", detail: "Easy aerobic pace", distanceMeters: 16000, intensity: "easy" },
    ],
  },
  {
    id: "race-cycle",
    title: "Race-Pace Cycle",
    subtitle: "40K time trial sim",
    description:
      "Hold race pace for 40K with controlled breathing. Best done on a flat loop or trainer.",
    activity: "cycle",
    level: "pro",
    durationMinutes: 80,
    distanceMeters: 40000,
    caloriesEstimate: 1200,
    tags: ["race", "threshold"],
    steps: [
      { label: "Warmup", detail: "Build to threshold", durationSeconds: 900, intensity: "moderate" },
      { label: "Time trial", detail: "Steady race pace", distanceMeters: 38000, intensity: "hard" },
      { label: "Cooldown", detail: "Spin", durationSeconds: 600, intensity: "recovery" },
    ],
  },
];

export const LEVEL_LABELS: Record<WorkoutLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  pro: "Pro",
};

export const ACTIVITY_LABELS: Record<WorkoutActivity, string> = {
  run: "Run",
  cycle: "Cycle",
  walk: "Walk",
};

export type Segment = {
  id: string;
  name: string;
  distanceMeters: number;
  elevationMeters: number;
  description: string;
  leaderboard: { rank: number; name: string; timeSeconds: number }[];
};

export const POPULAR_SEGMENTS: Segment[] = [
  {
    id: "riverside-mile",
    name: "Riverside Mile",
    distanceMeters: 1609,
    elevationMeters: 8,
    description: "Flat and fast — the local benchmark loop.",
    leaderboard: [
      { rank: 1, name: "Maya P.", timeSeconds: 286 },
      { rank: 2, name: "Devon K.", timeSeconds: 294 },
      { rank: 3, name: "Sara L.", timeSeconds: 301 },
      { rank: 4, name: "You", timeSeconds: 318 },
      { rank: 5, name: "Jules R.", timeSeconds: 325 },
    ],
  },
  {
    id: "sunset-hill",
    name: "Sunset Hill Climb",
    distanceMeters: 800,
    elevationMeters: 64,
    description: "Short, steep, and unforgiving. Set a PR at dusk.",
    leaderboard: [
      { rank: 1, name: "Theo M.", timeSeconds: 198 },
      { rank: 2, name: "Aria N.", timeSeconds: 211 },
      { rank: 3, name: "You", timeSeconds: 234 },
      { rank: 4, name: "Quinn O.", timeSeconds: 247 },
    ],
  },
  {
    id: "park-loop",
    name: "Park Loop 5K",
    distanceMeters: 5000,
    elevationMeters: 22,
    description: "Rolling hills through the park. A weekend favorite.",
    leaderboard: [
      { rank: 1, name: "Rio C.", timeSeconds: 1042 },
      { rank: 2, name: "You", timeSeconds: 1156 },
      { rank: 3, name: "Sam V.", timeSeconds: 1188 },
      { rank: 4, name: "Lena T.", timeSeconds: 1224 },
    ],
  },
];
