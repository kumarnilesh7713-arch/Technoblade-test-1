import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/IconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useGoals } from "@/contexts/GoalsContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { useUnits } from "@/contexts/UnitsContext";
import { useColors } from "@/hooks/useColors";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "system", label: "System", icon: "phone-portrait-outline" },
  { id: "light", label: "Light", icon: "sunny-outline" },
  { id: "dark", label: "Dark", icon: "moon-outline" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goals, setGoals } = useGoals();
  const { units, setUnits } = useUnits();
  const { mode, setMode } = useTheme();

  const distanceInUnits =
    units === "imperial"
      ? (goals.dailyDistanceMeters / 1609.344).toFixed(1)
      : (goals.dailyDistanceMeters / 1000).toFixed(1);

  const [distance, setDistance] = useState(distanceInUnits);
  const [calories, setCalories] = useState(`${goals.dailyCalories}`);
  const [minutes, setMinutes] = useState(`${goals.dailyMinutes}`);
  const [weekly, setWeekly] = useState(`${goals.weeklyWorkouts}`);

  const save = () => {
    const km =
      units === "imperial" ? parseFloat(distance) * 1.609344 : parseFloat(distance);
    setGoals({
      dailyDistanceMeters: Math.max(500, Math.round((isFinite(km) ? km : 5) * 1000)),
      dailyCalories: Math.max(100, parseInt(calories, 10) || 500),
      dailyMinutes: Math.max(10, parseInt(minutes, 10) || 30),
      weeklyWorkouts: Math.max(1, parseInt(weekly, 10) || 4),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.modalHeader, { paddingTop: insets.top + 12, borderColor: colors.border }]}>
        <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />
        <Text style={{ color: colors.foreground, fontSize: 17, fontFamily: "Inter_700Bold" }}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 22, paddingBottom: 60 }}
      >
        <Text style={[styles.section, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.themeRow]}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setMode(opt.id)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 16,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? colors.primaryForeground : colors.foreground}
                />
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, marginTop: 24 }]}>UNITS</Text>
        <View style={styles.themeRow}>
          {(["metric", "imperial"] as const).map((u) => {
            const active = units === u;
            return (
              <Pressable
                key={u}
                onPress={() => setUnits(u)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 16,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 14,
                  }}
                >
                  {u === "metric" ? "Kilometers" : "Miles"}
                </Text>
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {u === "metric" ? "km · m" : "mi · ft"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, marginTop: 24 }]}>
          DAILY GOALS
        </Text>
        <Field
          label={`Distance (${units === "imperial" ? "miles" : "km"})`}
          value={distance}
          onChange={setDistance}
          keyboardType="decimal-pad"
        />
        <Field
          label="Calories burned"
          value={calories}
          onChange={setCalories}
          keyboardType="number-pad"
        />
        <Field
          label="Active minutes"
          value={minutes}
          onChange={setMinutes}
          keyboardType="number-pad"
        />
        <Field
          label="Workouts per week"
          value={weekly}
          onChange={setWeekly}
          keyboardType="number-pad"
        />

        <View style={{ marginTop: 28 }}>
          <PrimaryButton label="Save changes" icon="checkmark" onPress={save} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "decimal-pad" | "number-pad";
}) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 14,
          color: colors.foreground,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontFamily: "Inter_700Bold",
          fontSize: 16,
        }}
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  section: {
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeCard: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
