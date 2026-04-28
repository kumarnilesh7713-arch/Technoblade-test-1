export type ChallengeKind = "daily" | "weekly";
export type ChallengeMetric =
  | "distance"
  | "duration"
  | "calories"
  | "workouts";

export type ChallengeTemplate = {
  id: string;
  kind: ChallengeKind;
  title: string;
  description: string;
  metric: ChallengeMetric;
  target: number;
  rewardLabel: string;
  rewardIcon:
    | "flame-outline"
    | "trophy-outline"
    | "ribbon-outline"
    | "medal-outline"
    | "flash-outline"
    | "rocket-outline";
};

export const DAILY_CHALLENGES: ChallengeTemplate[] = [
  {
    id: "daily-3k",
    kind: "daily",
    title: "Daily 3K",
    description: "Cover 3 kilometers any way you like.",
    metric: "distance",
    target: 3000,
    rewardLabel: "+10 XP",
    rewardIcon: "flash-outline",
  },
  {
    id: "daily-30min",
    kind: "daily",
    title: "Move 30",
    description: "Stay active for 30 minutes.",
    metric: "duration",
    target: 30 * 60,
    rewardLabel: "+10 XP",
    rewardIcon: "flame-outline",
  },
  {
    id: "daily-cal",
    kind: "daily",
    title: "Burn 300",
    description: "Burn 300 active calories.",
    metric: "calories",
    target: 300,
    rewardLabel: "+10 XP",
    rewardIcon: "rocket-outline",
  },
];

export const WEEKLY_CHALLENGES: ChallengeTemplate[] = [
  {
    id: "weekly-25k",
    kind: "weekly",
    title: "25K Week",
    description: "Cover 25 kilometers across the week.",
    metric: "distance",
    target: 25000,
    rewardLabel: "Bronze badge",
    rewardIcon: "medal-outline",
  },
  {
    id: "weekly-5sessions",
    kind: "weekly",
    title: "5 Sessions",
    description: "Complete 5 workouts before Sunday.",
    metric: "workouts",
    target: 5,
    rewardLabel: "Silver badge",
    rewardIcon: "ribbon-outline",
  },
  {
    id: "weekly-2k-cal",
    kind: "weekly",
    title: "2,000 Calories",
    description: "Burn two thousand active calories.",
    metric: "calories",
    target: 2000,
    rewardLabel: "Gold badge",
    rewardIcon: "trophy-outline",
  },
];

export const ALL_CHALLENGES = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];
