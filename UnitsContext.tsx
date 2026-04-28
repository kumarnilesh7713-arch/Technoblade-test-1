import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Units } from "@/lib/format";

const STORAGE_KEY = "fittrack:units-v1";

type UnitsContextValue = {
  units: Units;
  setUnits: (u: Units) => void;
};

const UnitsContext = createContext<UnitsContextValue | null>(null);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<Units>("metric");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === "metric" || value === "imperial") setUnitsState(value);
      })
      .catch(() => {});
  }, []);

  const setUnits = useCallback((u: Units) => {
    setUnitsState(u);
    AsyncStorage.setItem(STORAGE_KEY, u).catch(() => {});
  }, []);

  const value = useMemo(() => ({ units, setUnits }), [units, setUnits]);
  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits(): UnitsContextValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) return { units: "metric", setUnits: () => {} };
  return ctx;
}
