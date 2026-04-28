import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  background?: string;
  disabled?: boolean;
  haptic?: Haptics.ImpactFeedbackStyle;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function IconButton({
  icon,
  onPress,
  size = 22,
  color,
  background,
  disabled,
  haptic = Haptics.ImpactFeedbackStyle.Light,
  style,
  accessibilityLabel,
}: Props) {
  const colors = useColors();
  const fg = color ?? colors.foreground;
  const bg = background ?? "transparent";

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(haptic).catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
          width: size + 22,
          height: size + 22,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});

export default IconButton;
