import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { WorkoutActivity } from "@/constants/workouts";
import { useUnits } from "@/contexts/UnitsContext";
import { useWorkouts } from "@/contexts/WorkoutsContext";
import { useColors } from "@/hooks/useColors";
import {
  distanceUnitLabel,
  formatDistance,
  formatNumber,
  formatShortDuration,
} from "@/lib/format";

type Filter = "all" | WorkoutActivity;

const ICON: Record<WorkoutActivity, keyof typeof Ionicons.glyphMap> = {
  run: "walk-outline",
  cycle: "bicycle-outline",
  walk: "footsteps-outline",
};

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { units } = useUnits();
  const { workouts } = useWorkouts();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return workouts;
    return workouts.filter((w) => w.activity === filter);
  }, [workouts, filter]);

  const totals = useMemo(() => {
    return {
      sessions: filtered.length,
      distance: filtered.reduce((s, w) => s + w.distanceMeters, 0),
      seconds: filtered.reduce((s, w) => s + w.durationSeconds, 0),
      calories: filtered.reduce((s, w) => s + w.caloriesBurned, 0),
    };
  }, [filtered]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((w) => {
      const d = new Date(w.startedAt);
      const key = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120 + (Platform.OS === "web" ? 84 : insets.bottom),
        }}
      >
        <ScreenHeader eyebrow="History" title="Your log" subtitle="Every step counts" />

        <View
          style={[
            styles.totalsCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Total label="Sessions" value={`${totals.sessions}`} />
          <Sep />
          <Total
            label={`Distance (${distanceUnitLabel(units)})`}
            value={formatDistance(totals.distance, units)}
          />
          <Sep />
          <Total label="Time" value={formatShortDuration(totals.seconds)} />
          <Sep />
          <Total label="Calories" value={formatNumber(totals.calories)} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          <Pill label="All" active={filter === "all"} onPress={() => setFilter("all")} />
          <Pill
            label="Run"
            icon="walk-outline"
            active={filter === "run"}
            onPress={() => setFilter("run")}
            activeColor={colors.runColor}
          />
          <Pill
            label="Cycle"
            icon="bicycle-outline"
            active={filter === "cycle"}
            onPress={() => setFilter("cycle")}
            activeColor={colors.cycleColor}
          />
          <Pill
            label="Walk"
            icon="footsteps-outline"
            active={filter === "walk"}
            onPress={() => setFilter("walk")}
            activeColor={colors.walkColor}
          />
        </ScrollView>

        {filtered.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No activities yet"
            body="Start your first session and it'll show up here with maps, splits, and stats."
            style={{ marginHorizontal: 22, marginTop: 12 }}
          />
        ) : (
          <View style={{ paddingHorizontal: 22, gap: 14, marginTop: 6 }}>
            {groups.map(([dateKey, items]) => (
              <View key={dateKey} style={{ gap: 8 }}>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 11,
                    letterSpacing: 1.4,
                    fontFamily: "Inter_600SemiBold",
                    textTransform: "uppercase",
                    marginTop: 14,
                  }}
                >
                  {dateKey}
                </Text>
                {items.map((w) => {
                  const accent =
                    w.activity === "run"
                      ? colors.runColor
                      : w.activity === "cycle"
                        ? colors.cycleColor
                        : colors.walkColor;
                  return (
                    <Pressable
                      key={w.id}
                      onPress={() => router.push(`/log/${w.id}`)}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderRadius: colors.radius,
                          opacity: pressed ? 0.92 : 1,
                          transform: [{ scale: pressed ? 0.99 : 1 }],
                        },
                      ]}
                    >
                      <View style={[styles.icon, { backgroundColor: accent + "1F" }]}>
                        <Ionicons name={ICON[w.activity]} size={20} color={accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.foreground,
                            fontSize: 15,
                            fontFamily: "Inter_700Bold",
                          }}
                        >
                          {w.title}
                        </Text>
                        <Text
                          style={{
                            color: colors.mutedForeground,
                            fontSize: 12,
                            fontFamily: "Inter_500Medium",
                            marginTop: 2,
                          }}
                        >
                          {formatShortDuration(w.durationSeconds)} •{" "}
                          {formatNumber(w.caloriesBurned)} cal
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
                          {formatDistance(w.distanceMeters, units)}
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
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 18,
          fontFamily: "Inter_700Bold",
          letterSpacing: -0.4,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 10,
          letterSpacing: 1,
          fontFamily: "Inter_600SemiBold",
          textTransform: "uppercase",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Sep() {
  const colors = useColors();
  return <View style={{ width: 1, height: 30, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  totalsCard: {
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
  },
  pillRow: {
    paddingHorizontal: 22,
    gap: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
