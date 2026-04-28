import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChallengeCard } from "@/components/ChallengeCard";
import { GoalRings } from "@/components/GoalRings";
import { IconButton } from "@/components/IconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionTitle } from "@/components/SectionTitle";
import { useChallenges } from "@/contexts/ChallengesContext";
import { useGoals } from "@/contexts/GoalsContext";
import { useUnits } from "@/contexts/UnitsContext";
import { useWorkouts } from "@/contexts/WorkoutsContext";
import { useColors } from "@/hooks/useColors";
import {
  distanceUnitLabel,
  formatDistance,
  formatNumber,
  formatShortDuration,
  startOfDay,
  startOfWeek,
} from "@/lib/format";

function computeStreak(workouts: { startedAt: number }[]): number {
  if (!workouts.length) return 0;
  const days = new Set(
    workouts.map((w) => {
      const d = new Date(w.startedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );
  let streak = 0;
  const day = 24 * 60 * 60 * 1000;
  let cursor = startOfDay();
  if (!days.has(cursor)) cursor -= day;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= day;
  }
  return streak;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { units } = useUnits();
  const { goals } = useGoals();
  const { workouts, hydrated } = useWorkouts();
  const { daily } = useChallenges();
  const insets = useSafeAreaInsets();

  const todayMs = startOfDay();
  const weekMs = startOfWeek();

  const todayStats = useMemo(() => {
    const today = workouts.filter((w) => w.startedAt >= todayMs);
    return {
      distance: today.reduce((s, w) => s + w.distanceMeters, 0),
      calories: today.reduce((s, w) => s + w.caloriesBurned, 0),
      minutes: today.reduce((s, w) => s + w.durationSeconds / 60, 0),
      sessions: today.length,
    };
  }, [workouts, todayMs]);

  const weekStats = useMemo(() => {
    const week = workouts.filter((w) => w.startedAt >= weekMs);
    return {
      distance: week.reduce((s, w) => s + w.distanceMeters, 0),
      sessions: week.length,
    };
  }, [workouts, weekMs]);

  const streak = useMemo(() => computeStreak(workouts), [workouts]);
  const lifetimeDistance = useMemo(
    () => workouts.reduce((s, w) => s + w.distanceMeters, 0),
    [workouts],
  );

  const distanceProgress = todayStats.distance / goals.dailyDistanceMeters;
  const caloriesProgress = todayStats.calories / goals.dailyCalories;
  const minutesProgress = todayStats.minutes / goals.dailyMinutes;

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140 + (Platform.OS === "web" ? 84 : insets.bottom),
        }}
      >
        <ScreenHeader
          eyebrow={greeting.toUpperCase()}
          title="Today"
          subtitle="Move with intention"
          right={
            <IconButton
              icon="settings-outline"
              onPress={() => router.push("/settings")}
              accessibilityLabel="Settings"
            />
          }
        />

        <Animated.View entering={FadeIn.duration(500)} style={styles.heroWrap}>
          <LinearGradient
            colors={
              colors.scheme === "dark"
                ? ["rgba(255,107,61,0.18)", "rgba(255,200,87,0.04)"]
                : ["rgba(255,77,46,0.12)", "rgba(255,200,87,0.04)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.hero,
              {
                borderRadius: 28,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.heroLeft}>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 11,
                  letterSpacing: 1.4,
                  fontFamily: "Inter_600SemiBold",
                  textTransform: "uppercase",
                }}
              >
                Daily rings
              </Text>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 40,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -1,
                  marginTop: 6,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatDistance(todayStats.distance, units)}
                <Text style={{ fontSize: 18, color: colors.mutedForeground }}>
                  {" "}
                  {distanceUnitLabel(units)}
                </Text>
              </Text>

              <View style={styles.heroLegend}>
                <Legend color={colors.ringDistance} label="Distance" value={`${Math.round(Math.min(1, distanceProgress) * 100)}%`} />
                <Legend color={colors.ringCalories} label="Calories" value={`${Math.round(Math.min(1, caloriesProgress) * 100)}%`} />
                <Legend color={colors.ringMinutes} label="Minutes" value={`${Math.round(Math.min(1, minutesProgress) * 100)}%`} />
              </View>
            </View>
            <GoalRings
              size={170}
              distanceProgress={hydrated ? distanceProgress : 0}
              caloriesProgress={hydrated ? caloriesProgress : 0}
              minutesProgress={hydrated ? minutesProgress : 0}
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(120)}
          style={[styles.statsRow, { paddingHorizontal: 22 }]}
        >
          <MiniStat
            icon="flame-outline"
            label="Streak"
            value={`${streak}`}
            unit={streak === 1 ? "day" : "days"}
            accent={colors.primary}
          />
          <MiniStat
            icon="calendar-outline"
            label="This week"
            value={`${weekStats.sessions}`}
            unit={`/ ${goals.weeklyWorkouts}`}
            accent={colors.accent}
          />
          <MiniStat
            icon="infinite-outline"
            label="Lifetime"
            value={formatDistance(lifetimeDistance, units)}
            unit={distanceUnitLabel(units)}
            accent={colors.ringMinutes}
          />
        </Animated.View>

        <View style={[styles.ctaWrap, { paddingHorizontal: 22 }]}>
          <PrimaryButton
            label="Start Activity"
            icon="play"
            size="lg"
            onPress={() => router.push("/record")}
          />
        </View>

        <SectionTitle
          title="Today's challenges"
          action={{
            label: "See all",
            onPress: () => router.push("/(tabs)/challenges"),
          }}
        />
        <View style={styles.list}>
          {daily.slice(0, 2).map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </View>

        <SectionTitle
          title="Recent activity"
          action={{
            label: "History",
            onPress: () => router.push("/(tabs)/history"),
          }}
        />
        <View style={styles.list}>
          {workouts.slice(0, 3).map((w) => (
            <RecentRow
              key={w.id}
              activity={w.activity}
              title={w.title}
              distanceMeters={w.distanceMeters}
              durationSeconds={w.durationSeconds}
              calories={w.caloriesBurned}
              startedAt={w.startedAt}
              onPress={() => router.push(`/log/${w.id}`)}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            fontFamily: "Inter_500Medium",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 13,
            fontFamily: "Inter_700Bold",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function MiniStat({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  accent: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.miniStat,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18 },
      ]}
    >
      <View style={[styles.miniIcon, { backgroundColor: accent + "1F" }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 10,
          letterSpacing: 1.2,
          fontFamily: "Inter_600SemiBold",
          textTransform: "uppercase",
          marginTop: 8,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 22,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.4,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 11,
              fontFamily: "Inter_500Medium",
              marginLeft: 4,
              marginBottom: 3,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function RecentRow({
  activity,
  title,
  distanceMeters,
  durationSeconds,
  calories,
  startedAt,
  onPress,
}: {
  activity: "run" | "cycle" | "walk";
  title: string;
  distanceMeters: number;
  durationSeconds: number;
  calories: number;
  startedAt: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const { units } = useUnits();
  const accent =
    activity === "run"
      ? colors.runColor
      : activity === "cycle"
        ? colors.cycleColor
        : colors.walkColor;
  const icon: keyof typeof Ionicons.glyphMap =
    activity === "run"
      ? "walk-outline"
      : activity === "cycle"
        ? "bicycle-outline"
        : "footsteps-outline";
  const dateLabel = new Date(startedAt).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.recent,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={[styles.recentIcon, { backgroundColor: accent + "1F" }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 15,
            fontFamily: "Inter_700Bold",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 12,
            fontFamily: "Inter_500Medium",
            marginTop: 2,
          }}
        >
          {dateLabel} • {formatShortDuration(durationSeconds)} • {formatNumber(calories)} cal
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 17,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.3,
          }}
        >
          {formatDistance(distanceMeters, units)}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            fontFamily: "Inter_500Medium",
          }}
        >
          {distanceUnitLabel(units)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    paddingHorizontal: 22,
    marginTop: 4,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    minHeight: 220,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 8,
  },
  heroLegend: {
    marginTop: 20,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  miniStat: {
    flex: 1,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  miniIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrap: {
    marginTop: 22,
  },
  list: {
    paddingHorizontal: 22,
    gap: 10,
  },
  recent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
