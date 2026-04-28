import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

export function useColors() {
  const { effective } = useTheme();
  const palette = effective === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, scheme: effective } as const;
}

export type AppColors = ReturnType<typeof useColors>;
