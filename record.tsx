import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/IconButton";
import { Pill } from "@/components/Pill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RouteTrace } from "@/components/RouteTrace";
import {
  ACTIVITY_LABELS,
  WORKOUT_LIBRARY,
  type WorkoutActivity,
} from "@/constants/workouts";
import { useUnits } from "@/contexts/UnitsContext";
import { useWorkouts } from "@/contexts/WorkoutsContext";
import { useColors } from "@/hooks/useColors";
import {
  caloriesEstimate,
  computeSplits,
  elevationGain,
  haversine,
  type GeoPoint,
} from "@/lib/distance";
import {
  distanceUnitLabel,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPace,
  paceUnitLabel,
} from "@/lib/format";

type RecordingState = "idle" | "running" | "paused" | "stopped";

const TICK_MS = 1000;
const SIM_INTERVAL_MS = 1500;

function makeSimPoint(prev: GeoPoint | null, activity: WorkoutActivity): GeoPoint {
  const base = prev ?? {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 12,
    timestamp: Date.now(),
  };
  const speedMps =
    activity === "cycle" ? 6.5 : activity === "walk" ? 1.4 : 3.0;
  const dt = SIM_INTERVAL_MS / 1000;
  const distance = speedMps * dt;
  const angle = Math.sin(Date.now() / 9000) * Math.PI;
  const dLat = (Math.cos(angle) * distance) / 111111;
  const dLon =
    (Math.sin(angle) * distance) /
    (111111 * Math.cos((base.latitude * Math.PI) / 180));
  return {
    latitude: base.latitude + dLat,
    longitude: base.longitude + dLon,
    altitude: (base.altitude ?? 12) + Math.sin(Date.now() / 6000) * 0.3,
    timestamp: Date.now(),
  };
}

export default function RecordScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { units } = useUnits();
  const { saveWorkout } = useWorkouts();
  const params = useLocalSearchParams<{ workoutId?: string }>();
  const template = WORKOUT_LIBRARY.find((w) => w.id === params.workoutId);

  const [activity, setActivity] = useState<WorkoutActivity>(template?.activity ?? "run");
  const [state, setState] = useState<RecordingState>("idle");
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [usingSimulator, setUsingSimulator] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const lastResumeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef = useRef<GeoPoint | null>(null);

  const distanceMeters = useMemo(() => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += haversine(points[i - 1]!, points[i]!);
    }
    return total;
  }, [points]);

  const elapsedSeconds = elapsedMs / 1000;
  const pace = distanceMeters > 0 ? elapsedSeconds / (distanceMeters / 1000) : 0;
  const calories = caloriesEstimate(activity, distanceMeters, elapsedSeconds);
  const elevation = useMemo(() => elevationGain(points), [points]);

  useEffect(() => {
    return () => {
      tickRef.current && clearInterval(tickRef.current);
      simRef.current && clearInterval(simRef.current);
      watchSubRef.current?.remove();
    };
  }, []);

  const startTracking = async () => {
    setState("running");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    startedAtRef.current = startedAtRef.current ?? Date.now();
    lastResumeRef.current = Date.now();

    tickRef.current && clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (lastResumeRef.current) {
        setElapsedMs(accumulatedRef.current + (Date.now() - lastResumeRef.current));
      }
    }, TICK_MS);

    let useSim = true;
    if (Platform.OS !== "web") {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status === "granted") {
          useSim = false;
          setUsingSimulator(false);
          watchSubRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1500,
              distanceInterval: 3,
            },
            (loc) => {
              const point: GeoPoint = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                altitude: loc.coords.altitude ?? null,
                timestamp: loc.timestamp,
              };
              lastPointRef.current = point;
              setPoints((prev) => [...prev, point]);
            },
          );
        } else {
          setPermissionDenied(true);
        }
      } catch {
        useSim = true;
      }
    }

    if (useSim) {
      setUsingSimulator(true);
      simRef.current && clearInterval(simRef.current);
      simRef.current = setInterval(() => {
        const next = makeSimPoint(lastPointRef.current, activity);
        lastPointRef.current = next;
        setPoints((prev) => [...prev, next]);
      }, SIM_INTERVAL_MS);
    }
  };

  const pause = () => {
    setState("paused");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (lastResumeRef.current) {
      accumulatedRef.current += Date.now() - lastResumeRef.current;
      lastResumeRef.current = null;
    }
    tickRef.current && clearInterval(tickRef.current);
    simRef.current && clearInterval(simRef.current);
    watchSubRef.current?.remove();
    watchSubRef.current = null;
  };

  const resume = () => {
    startTracking();
  };

  const stop = () => {
    if (lastResumeRef.current) {
      accumulatedRef.current += Date.now() - lastResumeRef.current;
      lastResumeRef.current = null;
    }
    tickRef.current && clearInterval(tickRef.current);
    simRef.current && clearInterval(simRef.current);
    watchSubRef.current?.remove();
    watchSubRef.current = null;
    setState("stopped");
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const discard = () => {
    const reset = () => {
      setState("idle");
      setPoints([]);
      setElapsedMs(0);
      accumulatedRef.current = 0;
      startedAtRef.current = null;
      lastResumeRef.current = null;
      lastPointRef.current = null;
      router.back();
    };
    if (state === "idle") {
      router.back();
      return;
    }
    if (Platform.OS === "web") {
      if (confirm("Discard this activity?")) reset();
    } else {
      Alert.alert("Discard activity?", "Your tracked data will be lost.", [
        { text: "Keep", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: reset },
      ]);
    }
  };

  const save = () => {
    const startedAt = startedAtRef.current ?? Date.now() - elapsedMs;
    const splits = computeSplits(points);
    const route = points.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    const created = saveWorkout({
      activity,
      title:
        template?.title ??
        `${ACTIVITY_LABELS[activity]} • ${formatDistance(distanceMeters, units)} ${distanceUnitLabel(units)}`,
      startedAt,
      endedAt: Date.now(),
      durationSeconds: Math.round(elapsedSeconds),
      distanceMeters: Math.round(distanceMeters),
      caloriesBurned: Math.round(calories),
      averagePace: pace,
      elevationGainMeters: Math.round(elevation),
      splits,
      route,
      workoutTemplateId: template?.id,
    });
    router.replace(`/log/${created.id}`);
  };

  const accent =
    activity === "run"
      ? colors.runColor
      : activity === "cycle"
        ? colors.cycleColor
        : colors.walkColor;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={
          colors.scheme === "dark"
            ? [accent + "30", "rgba(10,14,26,0)"]
            : [accent + "1F", "rgba(255,255,255,0)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { height: 360 }]}
        pointerEvents="none"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 200,
        }}
      >
        <View style={styles.modalHeader}>
          <IconButton icon="chevron-down" onPress={discard} accessibilityLabel="Close" />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>
            {state === "idle"
              ? "New activity"
              : state === "stopped"
                ? "Activity complete"
                : "Recording"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {state === "idle" ? (
          <View style={[styles.section, { paddingTop: 8 }]}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                letterSpacing: 1.4,
                fontFamily: "Inter_600SemiBold",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Choose your sport
            </Text>
            <View style={styles.pillRow}>
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
            </View>
            {template ? (
              <View
                style={[
                  styles.templateCard,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                ]}
              >
                <Ionicons name="bookmark" size={18} color={accent} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 15,
                    }}
                  >
                    {template.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    {template.subtitle} • {template.durationMinutes} min target
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.bigStatWrap}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 11,
              letterSpacing: 1.4,
              fontFamily: "Inter_600SemiBold",
              textTransform: "uppercase",
            }}
          >
            Distance ({distanceUnitLabel(units)})
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 84,
              fontFamily: "Inter_700Bold",
              letterSpacing: -3,
              marginTop: 2,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatDistance(distanceMeters, units)}
          </Text>
        </View>

        <View style={[styles.metricsGrid, { paddingHorizontal: 22 }]}>
          <Metric label="Time" value={formatDuration(elapsedSeconds)} />
          <Metric
            label={`Pace (${paceUnitLabel(units)})`}
            value={formatPace(pace, units)}
          />
          <Metric label="Calories" value={formatNumber(calories)} />
          <Metric label="Elevation" value={`${formatNumber(elevation)} m`} />
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <RouteTrace points={points.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))} accent={accent} />
        </View>

        {usingSimulator || permissionDenied ? (
          <View style={[styles.banner, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                flex: 1,
              }}
            >
              {permissionDenied
                ? "Location denied — tracking with a demo route. Allow location in Settings to use real GPS."
                : Platform.OS === "web"
                  ? "Web preview uses a demo route. Tracking will use real GPS on a device."
                  : "Acquiring GPS… using a demo route to demonstrate metrics."}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View
        style={[
          styles.controlBar,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        {state === "idle" ? (
          <PrimaryButton
            label="Start"
            icon="play"
            size="lg"
            onPress={startTracking}
          />
        ) : null}
        {state === "running" ? (
          <View style={styles.controlRow}>
            <Pressable
              onPress={stop}
              style={[styles.smallBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            >
              <Ionicons name="stop" size={22} color={colors.destructive} />
            </Pressable>
            <Pressable
              onPress={pause}
              style={[
                styles.bigBtn,
                { backgroundColor: accent },
              ]}
            >
              <Ionicons name="pause" size={36} color={colors.primaryForeground} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/workouts")}
              style={[styles.smallBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            >
              <Ionicons name="musical-notes" size={20} color={colors.foreground} />
            </Pressable>
          </View>
        ) : null}
        {state === "paused" ? (
          <View style={styles.controlRow}>
            <Pressable
              onPress={stop}
              style={[styles.bigBtn, { backgroundColor: colors.destructive }]}
            >
              <Ionicons name="stop" size={32} color={colors.destructiveForeground} />
            </Pressable>
            <Pressable
              onPress={resume}
              style={[styles.bigBtn, { backgroundColor: accent }]}
            >
              <Ionicons name="play" size={32} color={colors.primaryForeground} />
            </Pressable>
          </View>
        ) : null}
        {state === "stopped" ? (
          <View style={{ gap: 10 }}>
            <PrimaryButton label="Save activity" icon="checkmark" onPress={save} size="lg" />
            <PrimaryButton
              label="Discard"
              variant="ghost"
              onPress={discard}
              icon="trash-outline"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.metric,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18 },
      ]}
    >
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 10,
          letterSpacing: 1.2,
          fontFamily: "Inter_600SemiBold",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 22,
          fontFamily: "Inter_700Bold",
          marginTop: 4,
          letterSpacing: -0.4,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 22,
    marginTop: 6,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  bigStatWrap: {
    paddingHorizontal: 22,
    marginTop: 18,
    alignItems: "flex-start",
  },
  metricsGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  banner: {
    marginHorizontal: 22,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  smallBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  bigBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
