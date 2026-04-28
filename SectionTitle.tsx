import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
};

export function SectionTitle({ title, action, style }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.row, style]}>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 18,
          fontFamily: "Inter_700Bold",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    marginTop: 24,
    marginBottom: 12,
  },
});

export default SectionTitle;
