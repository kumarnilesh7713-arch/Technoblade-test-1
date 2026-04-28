import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  style?: ViewStyle;
};

export function StatTile({ label, value, unit, icon, accent, style }: Props) {
  const colors = useColors();
  const tint = accent ?? colors.primary;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: tint + "22" },
            ]}
          >
            <Ionicons name={icon} size={14} color={tint} />
          </View>
        ) : null}
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            letterSpacing: 1.4,
            fontFamily: "Inter_600SemiBold",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 28,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.5,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 12,
              marginLeft: 6,
              marginBottom: 4,
              fontFamily: "Inter_500Medium",
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StatTile;
