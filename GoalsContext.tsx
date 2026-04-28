import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Goals = {
  weeklyDistanceMeters: number;
  weeklyWorkouts: number;
  dailyCalories: number;
  dailyMinutes: number;
  dailyDistanceMeters: number;
};

const DEFAULT_GOALS: Goals = {
  weeklyDistanceMeters: 25000,
  weeklyWorkouts: 5,
  dailyCalories: 600,
  dailyMinutes: 30,
  dailyDistanceMeters: 5000,
};

const STORAGE_KEY = "fittrack:goals-v1";

type GoalsContextValue = {
  goals: Goals;
  setGoals: (next: Partial<Goals>) => void;
  resetGoals: () => void;
};

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoalsState] = useState<Goals>(DEFAULT_GOALS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setGoalsState({ ...DEFAULT_GOALS, ...JSON.parse(raw) });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const setGoals = useCallback((partial: Partial<Goals>) => {
    setGoalsState((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetGoals = useCallback(() => {
    setGoalsState(DEFAULT_GOALS);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GOALS)).catch(
      () => {},
    );
  }, []);

  const value = useMemo(
    () => ({ goals, setGoals, resetGoals }),
    [goals, setGoals, resetGoals],
  );
  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error("useGoals must be used within GoalsProvider");
  return ctx;
}
