import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ALL_CHALLENGES,
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  type ChallengeKind,
  type ChallengeMetric,
  type ChallengeTemplate,
} from "@/constants/challenges";
import { startOfDay, startOfWeek } from "@/lib/format";
import { useWorkouts, type CompletedWorkout } from "@/contexts/WorkoutsContext";

export type ActiveChallenge = ChallengeTemplate & {
  progress: number;
  percent: number;
  completed: boolean;
  periodStart: number;
};

const STORAGE_KEY = "fittrack:challenges-claimed-v1";

type ChallengesContextValue = {
  daily: ActiveChallenge[];
  weekly: ActiveChallenge[];
  claim: (challengeId: string, periodStart: number) => void;
  isClaimed: (challengeId: string, periodStart: number) => boolean;
  totalXp: number;
};

const ChallengesContext = createContext<ChallengesContextValue | null>(null);

function metricFromWorkouts(
  workouts: CompletedWorkout[],
  metric: ChallengeMetric,
): number {
  switch (metric) {
    case "distance":
      return workouts.reduce((sum, w) => sum + w.distanceMeters, 0);
    case "duration":
      return workouts.reduce((sum, w) => sum + w.durationSeconds, 0);
    case "calories":
      return workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    case "workouts":
      return workouts.length;
  }
}

function computeChallenges(
  templates: ChallengeTemplate[],
  workouts: CompletedWorkout[],
  kind: ChallengeKind,
): ActiveChallenge[] {
  const periodStart =
    kind === "daily" ? startOfDay() : startOfWeek();
  const filtered = workouts.filter((w) => w.startedAt >= periodStart);
  return templates.map((tpl) => {
    const progress = metricFromWorkouts(filtered, tpl.metric);
    const percent = Math.min(1, progress / tpl.target);
    return {
      ...tpl,
      progress,
      percent,
      completed: percent >= 1,
      periodStart,
    };
  });
}

type ClaimedRecord = Record<string, true>;

export function ChallengesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workouts } = useWorkouts();
  const [claimed, setClaimed] = useState<ClaimedRecord>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setClaimed(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const claim = useCallback((challengeId: string, periodStart: number) => {
    const key = `${challengeId}:${periodStart}`;
    setClaimed((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true as const };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isClaimed = useCallback(
    (challengeId: string, periodStart: number) =>
      Boolean(claimed[`${challengeId}:${periodStart}`]),
    [claimed],
  );

  const daily = useMemo(
    () => computeChallenges(DAILY_CHALLENGES, workouts, "daily"),
    [workouts],
  );

  const weekly = useMemo(
    () => computeChallenges(WEEKLY_CHALLENGES, workouts, "weekly"),
    [workouts],
  );

  const totalXp = useMemo(() => {
    const claimedCount = Object.keys(claimed).length;
    return claimedCount * 10 + ALL_CHALLENGES.length;
  }, [claimed]);

  const value = useMemo(
    () => ({ daily, weekly, claim, isClaimed, totalXp }),
    [daily, weekly, claim, isClaimed, totalXp],
  );

  return (
    <ChallengesContext.Provider value={value}>
      {children}
    </ChallengesContext.Provider>
  );
}

export function useChallenges(): ChallengesContextValue {
  const ctx = useContext(ChallengesContext);
  if (!ctx) {
    throw new Error("useChallenges must be used within ChallengesProvider");
  }
  return ctx;
}
