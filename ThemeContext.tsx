import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  effective: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  hydrated: boolean;
};

const STORAGE_KEY = "fittrack:theme-mode-v1";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!mounted) return;
        if (value === "light" || value === "dark" || value === "system") {
          setModeState(value);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const effective: "light" | "dark" = useMemo(() => {
    if (mode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return mode;
  }, [mode, systemScheme]);

  const value = useMemo(
    () => ({ mode, effective, setMode, hydrated }),
    [mode, effective, setMode, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: "system",
      effective: "light",
      setMode: () => {},
      hydrated: true,
    };
  }
  return ctx;
}
