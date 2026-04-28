import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  style?: ViewStyle;
};

export function EmptyState({ icon, title, body, style }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={26} color={colors.mutedForeground} />
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 16,
          fontFamily: "Inter_700Bold",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 13,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});

export default EmptyState;
