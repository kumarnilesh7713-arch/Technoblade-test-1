import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/IconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  ACTIVITY_LABELS,
  LEVEL_LABELS,
  WORKOUT_LIBRARY,
} from "@/constants/workouts";
import { useUnits } from "@/contexts/UnitsContext";
import { useColors } from "@/hooks/useColors";
import {
  distanceUnitLabel,
  formatDistance,
  formatNumber,
  formatShortDuration,
} from "@/lib/format";

const INTENSITY_COLORS: Record<string, string> = {
  easy: "#34D399",
  moderate: "#FFC857",
  hard: "#FF6B3D",
  recovery: "#5EB1FF",
};

export default function WorkoutDetail() {
  const colors = useColors();
  const router = useRouter();
  const { units } = useUnits();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = WORKOUT_LIBRARY.find((w) => w.id === id);

  if (!workout) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>
          Workout not found
        </Text>
        <PrimaryButton label="Back" onPress={() => router.back()} variant="ghost" />
      </View>
    );
  }

  const accent =
    workout.activity === "run"
      ? colors.runColor
      : workout.activity === "cycle"
        ? colors.cycleColor
        : colors.walkColor;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <LinearGradient
          colors={
            colors.scheme === "dark"
              ? [accent + "40", "rgba(10,14,26,0)"]
              : [accent + "26", "rgba(255,255,255,0)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.heroBar}>
            <IconButton
              icon="chevron-back"
              onPress={() => router.back()}
              accessibilityLabel="Back"
            />
            <View style={{ width: 40 }} />
          </View>
          <View style={{ paddingHorizontal: 22, marginTop: 6 }}>
            <Text
              style={{
                color: accent,
                fontSize: 11,
                letterSpacing: 1.4,
                fontFamily: "Inter_700Bold",
                textTransform: "uppercase",
              }}
            >
              {LEVEL_LABELS[workout.level]} • {ACTIVITY_LABELS[workout.activity]}
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 32,
                fontFamily: "Inter_700Bold",
                marginTop: 8,
                letterSpacing: -0.6,
              }}
            >
              {workout.title}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                marginTop: 6,
                lineHeight: 22,
              }}
            >
              {workout.description}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statRow}>
          <Stat label="Time" value={formatShortDuration(workout.durationMinutes * 60)} />
          <Sep />
          <Stat
            label={`Distance ${distanceUnitLabel(units)}`}
            value={formatDistance(workout.distanceMeters, units)}
          />
          <Sep />
          <Stat label="Calories" value={formatNumber(workout.caloriesEstimate)} />
        </View>

        <View style={styles.tags}>
          {workout.tags.map((t) => (
            <View
              key={t}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.elevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {t}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground },
          ]}
        >
          Workout structure
        </Text>
        <View style={{ paddingHorizontal: 22, gap: 10 }}>
          {workout.steps.map((step, i) => {
            const intensityColor = INTENSITY_COLORS[step.intensity] ?? colors.primary;
            return (
              <View
                key={`${step.label}-${i}`}
                style={[
                  styles.step,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.stepDot, { backgroundColor: intensityColor }]} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 15,
                    }}
                  >
                    {step.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {step.detail}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 14,
                  }}
                >
                  {step.durationSeconds
                    ? formatShortDuration(step.durationSeconds)
                    : step.distanceMeters
                      ? `${formatDistance(step.distanceMeters, units)} ${distanceUnitLabel(units)}`
                      : ""}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.cta,
          {
            paddingBottom: Math.max(insets.bottom, 16) + (Platform.OS === "web" ? 16 : 0),
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          label="Start this workout"
          icon="play"
          size="lg"
          onPress={() => router.push(`/record?workoutId=${workout.id}`)}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Sep() {
  const colors = useColors();
  return <View style={{ width: 1, height: 28, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 18,
  },
  heroBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  statRow: {
    marginHorizontal: 22,
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tags: {
    flexDirection: "row",
    paddingHorizontal: 22,
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    paddingHorizontal: 22,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
    marginTop: 28,
    marginBottom: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
