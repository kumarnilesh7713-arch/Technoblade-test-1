import React from "react";
import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
  left,
  style,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 24 : Math.max(insets.top, 12);

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: topPad + 12, backgroundColor: colors.background },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {eyebrow ? (
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                letterSpacing: 1.4,
                fontFamily: "Inter_600SemiBold",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {left}
            <Text
              style={{
                color: colors.foreground,
                fontSize: 30,
                fontFamily: "Inter_700Bold",
                letterSpacing: -0.6,
              }}
            >
              {title}
            </Text>
          </View>
          {subtitle ? (
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 14,
                marginTop: 4,
                fontFamily: "Inter_400Regular",
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  right: {
    marginLeft: 12,
  },
});

export default ScreenHeader;
