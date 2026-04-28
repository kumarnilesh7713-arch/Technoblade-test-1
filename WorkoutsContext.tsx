import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { GeoPoint, Split } from "@/lib/distance";
import type { WorkoutActivity } from "@/constants/workouts";

export type CompletedWorkout = {
  id: string;
  activity: WorkoutActivity;
  title: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  distanceMeters: number;
  caloriesBurned: number;
  averagePace: number;
  elevationGainMeters: number;
  splits: Split[];
  route: { latitude: number; longitude: number }[];
  workoutTemplateId?: string;
  segmentBests?: { segmentId: string; timeSeconds: number }[];
  notes?: string;
};

type SaveInput = Omit<CompletedWorkout, "id">;

type WorkoutsContextValue = {
  workouts: CompletedWorkout[];
  hydrated: boolean;
  saveWorkout: (input: SaveInput) => CompletedWorkout;
  deleteWorkout: (id: string) => void;
  clearAll: () => void;
  getById: (id: string) => CompletedWorkout | undefined;
};

const STORAGE_KEY = "fittrack:workouts-v1";

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function seedWorkouts(): CompletedWorkout[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const baseRoute = (lat: number, lon: number, n: number, spread = 0.004) => {
    const route: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const wobble = Math.sin(t * Math.PI * 2) * spread * 0.4;
      route.push({
        latitude: lat + Math.sin(t * Math.PI) * spread + wobble,
        longitude: lon + Math.cos(t * Math.PI) * spread - wobble,
      });
    }
    return route;
  };

  return [
    {
      id: "seed-1",
      activity: "run",
      title: "Easy Morning Run",
      startedAt: now - 2 * day,
      endedAt: now - 2 * day + 28 * 60 * 1000,
      durationSeconds: 28 * 60,
      distanceMeters: 5200,
      caloriesBurned: 360,
      averagePace: 323,
      elevationGainMeters: 18,
      splits: [
        { index: 1, distanceMeters: 1000, durationSeconds: 320, pace: 320 },
        { index: 2, distanceMeters: 1000, durationSeconds: 318, pace: 318 },
        { index: 3, distanceMeters: 1000, durationSeconds: 326, pace: 326 },
        { index: 4, distanceMeters: 1000, durationSeconds: 324, pace: 324 },
        { index: 5, distanceMeters: 1000, durationSeconds: 327, pace: 327 },
        { index: 6, distanceMeters: 200, durationSeconds: 67, pace: 335 },
      ],
      route: baseRoute(37.7749, -122.4194, 28),
    },
    {
      id: "seed-2",
      activity: "cycle",
      title: "Sunset Spin",
      startedAt: now - 4 * day,
      endedAt: now - 4 * day + 62 * 60 * 1000,
      durationSeconds: 62 * 60,
      distanceMeters: 24800,
      caloriesBurned: 580,
      averagePace: 150,
      elevationGainMeters: 142,
      splits: [],
      route: baseRoute(37.7749, -122.4194, 36, 0.012),
    },
    {
      id: "seed-3",
      activity: "walk",
      title: "Neighborhood Walk",
      startedAt: now - 5 * day,
      endedAt: now - 5 * day + 32 * 60 * 1000,
      durationSeconds: 32 * 60,
      distanceMeters: 2700,
      caloriesBurned: 145,
      averagePace: 711,
      elevationGainMeters: 6,
      splits: [],
      route: baseRoute(37.7749, -122.4194, 24, 0.002),
    },
  ];
}

export function WorkoutsProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as CompletedWorkout[];
            setWorkouts(parsed);
          } catch {
            setWorkouts(seedWorkouts());
          }
        } else {
          const seeded = seedWorkouts();
          setWorkouts(seeded);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded)).catch(
            () => {},
          );
        }
        setHydrated(true);
      })
      .catch(() => {
        if (mounted) {
          setWorkouts(seedWorkouts());
          setHydrated(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workouts)).catch(() => {});
  }, [workouts, hydrated]);

  const saveWorkout = useCallback((input: SaveInput) => {
    const created: CompletedWorkout = { ...input, id: genId() };
    setWorkouts((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setWorkouts([]);
  }, []);

  const getById = useCallback(
    (id: string) => workouts.find((w) => w.id === id),
    [workouts],
  );

  const value = useMemo(
    () => ({ workouts, hydrated, saveWorkout, deleteWorkout, clearAll, getById }),
    [workouts, hydrated, saveWorkout, deleteWorkout, clearAll, getById],
  );

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts(): WorkoutsContextValue {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) {
    throw new Error("useWorkouts must be used within WorkoutsProvider");
  }
  return ctx;
}
