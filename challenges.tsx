import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChallengeCard } from "@/components/ChallengeCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionTitle } from "@/components/SectionTitle";
import { useChallenges } from "@/contexts/ChallengesContext";
import { useColors } from "@/hooks/useColors";

export default function ChallengesScreen() {
  const colors = useColors();
  const { daily, weekly, totalXp } = useChallenges();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120 + (Platform.OS === "web" ? 84 : insets.bottom),
        }}
      >
        <ScreenHeader
          eyebrow="Challenges"
          title="Earn it"
          subtitle="Daily and weekly streaks to keep momentum"
          right={
            <View
              style={[
                styles.xpPill,
                { backgroundColor: colors.elevated, borderColor: colors.border },
              ]}
            >
              <Ionicons name="flash" size={14} color={colors.primary} />
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 13,
                  fontFamily: "Inter_700Bold",
                  marginLeft: 4,
                }}
              >
                {totalXp} XP
              </Text>
            </View>
          }
        />

        <SectionTitle title="Daily" />
        <View style={styles.list}>
          {daily.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </View>

        <SectionTitle title="This week" />
        <View style={styles.list}>
          {weekly.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 22,
    gap: 10,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
