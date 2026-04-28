import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionTitle } from "@/components/SectionTitle";
import { useChallenges } from "@/contexts/ChallengesContext";
import { useGoals } from "@/contexts/GoalsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUnits } from "@/contexts/UnitsContext";
import { useWorkouts } from "@/contexts/WorkoutsContext";
import { useColors } from "@/hooks/useColors";
import { distanceUnitLabel, formatDistance, formatNumber } from "@/lib/format";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { units, setUnits } = useUnits();
  const { mode, setMode } = useTheme();
  const { workouts, clearAll } = useWorkouts();
  const { goals } = useGoals();
  const { totalXp } = useChallenges();

  const totals = useMemo(() => {
    return {
      sessions: workouts.length,
      distance: workouts.reduce((s, w) => s + w.distanceMeters, 0),
      calories: workouts.reduce((s, w) => s + w.caloriesBurned, 0),
    };
  }, [workouts]);

  const handleClear = () => {
    if (Platform.OS === "web") {
      if (confirm("Reset all data? This will delete all workouts.")) clearAll();
    } else {
      Alert.alert(
        "Reset all data",
        "This will permanently delete every workout. Goals are kept.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => clearAll() },
        ],
      );
    }
  };

  const comingSoon = (label: string) => () => {
    if (Platform.OS === "web") {
      alert(`${label} — coming soon`);
    } else {
      Alert.alert(label, "Coming soon to FitTrack.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120 + (Platform.OS === "web" ? 84 : insets.bottom),
        }}
      >
        <ScreenHeader eyebrow="Profile" title="You" subtitle="Tune your experience" />

        <LinearGradient
          colors={
            colors.scheme === "dark"
              ? ["rgba(255,107,61,0.18)", "rgba(11,15,26,0)"]
              : ["rgba(255,77,46,0.12)", "rgba(255,255,255,0)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.profileCard,
            { borderRadius: 24, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text
              style={{
                color: colors.primaryForeground,
                fontFamily: "Inter_700Bold",
                fontSize: 24,
              }}
            >
              FT
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 20,
              }}
            >
              FitTrack Athlete
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Level up by hitting your daily rings
            </Text>
            <View style={styles.statRow}>
              <Stat label="XP" value={`${totalXp}`} />
              <Stat label="Sessions" value={`${totals.sessions}`} />
              <Stat
                label={distanceUnitLabel(units)}
                value={formatDistance(totals.distance, units)}
              />
            </View>
          </View>
        </LinearGradient>

        <SectionTitle title="Daily goals" action={{ label: "Edit", onPress: () => router.push("/settings") }} />
        <View style={[styles.list]}>
          <Row
            icon="map-outline"
            iconColor={colors.ringDistance}
            title="Distance"
            value={`${formatDistance(goals.dailyDistanceMeters, units)} ${distanceUnitLabel(units)}`}
          />
          <Row
            icon="flame-outline"
            iconColor={colors.ringCalories}
            title="Calories"
            value={`${formatNumber(goals.dailyCalories)} cal`}
          />
          <Row
            icon="time-outline"
            iconColor={colors.ringMinutes}
            title="Active minutes"
            value={`${goals.dailyMinutes} min`}
          />
          <Row
            icon="calendar-outline"
            iconColor={colors.accent}
            title="Workouts per week"
            value={`${goals.weeklyWorkouts}`}
          />
        </View>

        <SectionTitle title="Preferences" />
        <View style={styles.list}>
          <Row
            icon="moon-outline"
            iconColor={colors.foreground}
            title="Appearance"
            value={mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light"}
            onPress={() => {
              const next = mode === "system" ? "dark" : mode === "dark" ? "light" : "system";
              setMode(next);
            }}
            chevron
          />
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="resize-outline" size={18} color={colors.foreground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 15,
                  fontFamily: "Inter_700Bold",
                }}
              >
                Use miles
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  marginTop: 2,
                }}
              >
                {units === "imperial" ? "Imperial" : "Metric (km)"}
              </Text>
            </View>
            <Switch
              value={units === "imperial"}
              onValueChange={(v) => setUnits(v ? "imperial" : "metric")}
              trackColor={{ true: colors.primary, false: colors.muted }}
              thumbColor={Platform.OS === "android" ? "#fff" : undefined}
            />
          </View>
        </View>

        <SectionTitle title="Coming soon" />
        <View style={styles.list}>
          <Row
            icon="logo-google"
            iconColor={colors.foreground}
            title="Sign in with Google"
            value="Coming soon"
            onPress={comingSoon("Google sign-in")}
            disabled
          />
          <Row
            icon="call-outline"
            iconColor={colors.foreground}
            title="Phone number login"
            value="Coming soon"
            onPress={comingSoon("Phone login")}
            disabled
          />
          <Row
            icon="bluetooth-outline"
            iconColor={colors.foreground}
            title="Pair Bluetooth heart-rate monitor"
            value="Coming soon"
            onPress={comingSoon("Bluetooth devices")}
            disabled
          />
        </View>

        <SectionTitle title="Data" />
        <View style={styles.list}>
          <Row
            icon="trash-outline"
            iconColor={colors.destructive}
            title="Reset all activity"
            value=""
            onPress={handleClear}
            chevron
          />
        </View>

        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 11,
            textAlign: "center",
            marginTop: 28,
            fontFamily: "Inter_500Medium",
          }}
        >
          FitTrack v1 • Built with Expo
        </Text>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ marginRight: 16 }}>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 16,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Row({
  icon,
  iconColor,
  title,
  value,
  onPress,
  chevron,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  onPress?: () => void;
  chevron?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean } = {}) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + "1F" }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
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
        {value ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              marginTop: 2,
            }}
          >
            {value}
          </Text>
        ) : null}
      </View>
      {chevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      ) : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginHorizontal: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  list: {
    paddingHorizontal: 22,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
