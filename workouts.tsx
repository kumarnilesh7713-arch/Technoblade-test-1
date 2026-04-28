import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pill } from "@/components/Pill";
import { ScreenHeader } from "@/components/ScreenHeader";
import { WorkoutCard } from "@/components/WorkoutCard";
import { WORKOUT_LIBRARY, type WorkoutActivity, type WorkoutLevel } from "@/constants/workouts";
import { useColors } from "@/hooks/useColors";

type LevelFilter = "all" | WorkoutLevel;
type ActivityFilter = "all" | WorkoutActivity;

export default function WorkoutsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<LevelFilter>("all");
  const [activity, setActivity] = useState<ActivityFilter>("all");

  const filtered = useMemo(() => {
    return WORKOUT_LIBRARY.filter((w) => {
      if (level !== "all" && w.level !== level) return false;
      if (activity !== "all" && w.activity !== activity) return false;
      return true;
    });
  }, [level, activity]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120 + (Platform.OS === "web" ? 84 : insets.bottom),
        }}
      >
        <ScreenHeader
          eyebrow="Workouts"
          title="Pick your push"
          subtitle="Guided sessions for every level"
        />

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            <Pill label="All levels" active={level === "all"} onPress={() => setLevel("all")} />
            <Pill
              label="Beginner"
              active={level === "beginner"}
              onPress={() => setLevel("beginner")}
              activeColor={colors.walkColor}
            />
            <Pill
              label="Intermediate"
              active={level === "intermediate"}
              onPress={() => setLevel("intermediate")}
              activeColor={colors.cycleColor}
            />
            <Pill
              label="Pro"
              active={level === "pro"}
              onPress={() => setLevel("pro")}
              activeColor={colors.primary}
            />
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            <Pill
              label="All sports"
              icon="grid-outline"
              active={activity === "all"}
              onPress={() => setActivity("all")}
            />
            <Pill
              label="Run"
              icon="walk-outline"
              active={activity === "run"}
              onPress={() => setActivity("run")}
              activeColor={colors.runColor}
            />
            <Pill
              label="Cycle"
              icon="bicycle-outline"
              active={activity === "cycle"}
              onPress={() => setActivity("cycle")}
              activeColor={colors.cycleColor}
            />
            <Pill
              label="Walk"
              icon="footsteps-outline"
              active={activity === "walk"}
              onPress={() => setActivity("walk")}
              activeColor={colors.walkColor}
            />
          </ScrollView>
        </View>

        <View style={styles.list}>
          {filtered.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onPress={() => router.push(`/workout/${w.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    marginTop: 6,
  },
  pillRow: {
    paddingHorizontal: 22,
    gap: 8,
    paddingVertical: 6,
  },
  list: {
    marginTop: 14,
    paddingHorizontal: 22,
    gap: 10,
  },
});
