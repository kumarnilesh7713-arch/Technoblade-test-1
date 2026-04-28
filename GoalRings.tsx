import React, { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor: string;
  delay?: number;
  gradientId: string;
  gradientStop?: string;
};

function Ring({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  delay = 0,
  gradientId,
  gradientStop,
}: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.min(1, Math.max(0, progress));
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = 0;
    animated.value = withTiming(target, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, animated, delay]);

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - animated.value);
    return { strokeDashoffset: offset } as { strokeDashoffset: number };
  });

  return (
    <Svg
      width={size}
      height={size}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={1} />
          <Stop
            offset="1"
            stopColor={gradientStop ?? color}
            stopOpacity={0.85}
          />
        </LinearGradient>
      </Defs>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        animatedProps={animatedProps}
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

type GoalRingsProps = {
  size?: number;
  distanceProgress: number;
  caloriesProgress: number;
  minutesProgress: number;
  style?: ViewStyle;
};

export function GoalRings({
  size = 220,
  distanceProgress,
  caloriesProgress,
  minutesProgress,
  style,
}: GoalRingsProps) {
  const colors = useColors();
  const stroke = Math.max(10, Math.round(size * 0.07));
  const gap = stroke + 6;

  const trackColor =
    colors.scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(11,15,26,0.07)";

  return (
    <View
      style={[
        { width: size, height: size, alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      <Ring
        size={size}
        strokeWidth={stroke}
        progress={distanceProgress}
        color={colors.ringDistance}
        gradientStop={colors.accent}
        trackColor={trackColor}
        gradientId="distance-gradient"
      />
      <Ring
        size={size - gap * 2}
        strokeWidth={stroke}
        progress={caloriesProgress}
        color={colors.ringCalories}
        gradientStop={colors.ringDistance}
        trackColor={trackColor}
        gradientId="calories-gradient"
        delay={120}
      />
      <Ring
        size={size - gap * 4}
        strokeWidth={stroke}
        progress={minutesProgress}
        color={colors.ringMinutes}
        gradientStop={colors.ringCalories}
        trackColor={trackColor}
        gradientId="minutes-gradient"
        delay={240}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
export default GoalRings;
