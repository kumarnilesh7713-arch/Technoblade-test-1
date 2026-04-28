import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "lg" | "md" | "sm";
  style?: ViewStyle;
  haptic?: Haptics.ImpactFeedbackStyle;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading,
  disabled,
  variant = "primary",
  size = "md",
  style,
  haptic = Haptics.ImpactFeedbackStyle.Medium,
}: Props) {
  const colors = useColors();

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
          ? colors.elevated
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "destructive"
        ? colors.destructiveForeground
        : variant === "secondary"
          ? colors.foreground
          : colors.foreground;
  const borderColor = variant === "ghost" ? colors.border : "transparent";

  const padV = size === "lg" ? 18 : size === "sm" ? 10 : 14;
  const padH = size === "lg" ? 28 : size === "sm" ? 16 : 22;
  const fontSize = size === "lg" ? 17 : size === "sm" ? 13 : 15;
  const radius = size === "lg" ? 28 : size === "sm" ? 14 : 18;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(haptic).catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === "ghost" ? 1 : 0,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: radius,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons name={icon} size={fontSize + 4} color={fg} />
          ) : null}
          <Text
            style={[
              styles.label,
              {
                color: fg,
                fontSize,
                fontFamily: "Inter_700Bold",
                letterSpacing: 0.3,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    textAlign: "center",
  },
});

export default PrimaryButton;
