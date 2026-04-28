import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { LEVEL_LABELS, type Workout } from "@/constants/workouts";
import { useUnits } from "@/contexts/UnitsContext";
import { useColors } from "@/hooks/useColors";
import { distanceUnitLabel, formatDistance, formatShortDuration } from "@/lib/format";

const ACTIVITY_ICON: Record<Workout["activity"], keyof typeof Ionicons.glyphMap> = {
  run: "walk-outline",
  cycle: "bicycle-outline",
  walk: "footsteps-outline",
};

type Props = {
  workout: Workout;
  onPress?: (w: Workout) => void;
};

export function WorkoutCard({ workout, onPress }: Props) {
  const colors = useColors();
  const { units } = useUnits();
  const accent =
    workout.activity === "run"
      ? colors.runColor
      : workout.activity === "cycle"
        ? colors.cycleColor
        : colors.walkColor;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.(workout);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: accent + "1F" }]}>
          <Ionicons name={ACTIVITY_ICON[workout.activity]} size={22} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                letterSpacing: 1.4,
                fontFamily: "Inter_600SemiBold",
                textTransform: "uppercase",
              }}
            >
              {LEVEL_LABELS[workout.level]}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                letterSpacing: 1.4,
                fontFamily: "Inter_600SemiBold",
                textTransform: "uppercase",
              }}
            >
              {workout.activity.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 17,
              fontFamily: "Inter_700Bold",
              marginTop: 2,
            }}
          >
            {workout.title}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              marginTop: 2,
            }}
          >
            {workout.subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
      <View style={styles.metricsRow}>
        <Metric icon="time-outline" value={formatShortDuration(workout.durationMinutes * 60)} />
        <Metric
          icon="map-outline"
          value={`${formatDistance(workout.distanceMeters, units)} ${distanceUnitLabel(units)}`}
        />
        <Metric icon="flame-outline" value={`${workout.caloriesEstimate} cal`} />
      </View>
    </Pressable>
  );
}

function Metric({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={14} color={colors.mutedForeground} />
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontFamily: "Inter_500Medium",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default WorkoutCard;
