import React, { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

type Props = {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
  style,
}: Props) {
  const colors = useColors();
  const fill = color ?? colors.primary;
  const track =
    trackColor ??
    (colors.scheme === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(11,15,26,0.08)");

  const target = Math.max(0, Math.min(1, progress));
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(target, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animated.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: track,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: fill,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
});

export default ProgressBar;
