import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ProgressBar";
import { useChallenges, type ActiveChallenge } from "@/contexts/ChallengesContext";
import { useUnits } from "@/contexts/UnitsContext";
import { useColors } from "@/hooks/useColors";
import { distanceUnitLabel, formatDistance, formatNumber, formatShortDuration } from "@/lib/format";

type Props = {
  challenge: ActiveChallenge;
};

function formatProgress(metric: ActiveChallenge["metric"], value: number, units: ReturnType<typeof useUnits>["units"]) {
  switch (metric) {
    case "distance":
      return `${formatDistance(value, units)} ${distanceUnitLabel(units)}`;
    case "duration":
      return formatShortDuration(value);
    case "calories":
      return `${formatNumber(value)} cal`;
    case "workouts":
      return `${formatNumber(value)} session${value === 1 ? "" : "s"}`;
  }
}

export function ChallengeCard({ challenge }: Props) {
  const colors = useColors();
  const { units } = useUnits();
  const { claim, isClaimed } = useChallenges();
  const claimed = isClaimed(challenge.id, challenge.periodStart);
  const canClaim = challenge.completed && !claimed;
  const accent = challenge.kind === "daily" ? colors.primary : colors.accent;

  const onClaim = () => {
    if (!canClaim) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    claim(challenge.id, challenge.periodStart);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.head}>
        <View style={[styles.iconBadge, { backgroundColor: accent + "1F" }]}>
          <Ionicons name={challenge.rewardIcon} size={20} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 16,
              fontFamily: "Inter_700Bold",
            }}
          >
            {challenge.title}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              marginTop: 2,
            }}
          >
            {challenge.description}
          </Text>
        </View>
        {claimed ? (
          <View style={[styles.pill, { backgroundColor: colors.success + "22" }]}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 11, fontFamily: "Inter_700Bold" }}>
              Claimed
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bar}>
        <ProgressBar
          progress={challenge.percent}
          color={challenge.completed ? colors.success : accent}
        />
      </View>

      <View style={styles.foot}>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 12,
            fontFamily: "Inter_500Medium",
          }}
        >
          {formatProgress(challenge.metric, challenge.progress, units)} of{" "}
          {formatProgress(challenge.metric, challenge.target, units)}
        </Text>
        {canClaim ? (
          <Pressable
            onPress={onClaim}
            style={({ pressed }) => [
              styles.claimBtn,
              {
                backgroundColor: colors.success,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text
              style={{
                color: colors.successForeground,
                fontSize: 12,
                fontFamily: "Inter_700Bold",
                letterSpacing: 0.4,
              }}
            >
              CLAIM {challenge.rewardLabel.toUpperCase()}
            </Text>
          </Pressable>
        ) : (
          <Text
            style={{
              color: challenge.completed ? colors.success : colors.mutedForeground,
              fontSize: 12,
              fontFamily: "Inter_700Bold",
            }}
          >
            {challenge.rewardLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bar: {
    width: "100%",
  },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  claimBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
});

export default ChallengeCard;
