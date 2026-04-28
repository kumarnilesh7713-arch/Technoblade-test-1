import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  activeColor?: string;
  style?: ViewStyle;
};

export function Pill({ label, active, onPress, icon, activeColor, style }: Props) {
  const colors = useColors();
  const tint = activeColor ?? colors.primary;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? tint : colors.card,
          borderColor: active ? tint : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.primaryForeground : colors.foreground}
        />
      ) : null}
      <Text
        style={{
          color: active ? colors.primaryForeground : colors.foreground,
          fontSize: 13,
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});

export default Pill;
