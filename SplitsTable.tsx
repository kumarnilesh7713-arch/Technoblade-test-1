import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useUnits } from "@/contexts/UnitsContext";
import { useColors } from "@/hooks/useColors";
import type { Split } from "@/lib/distance";
import { formatPace, paceUnitLabel } from "@/lib/format";

type Props = {
  splits: Split[];
  accent?: string;
};

export function SplitsTable({ splits, accent }: Props) {
  const colors = useColors();
  const { units } = useUnits();
  const tint = accent ?? colors.primary;

  if (splits.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 13,
            fontFamily: "Inter_500Medium",
          }}
        >
          No splits recorded
        </Text>
      </View>
    );
  }

  const fastest = splits.reduce(
    (min, s) => (s.pace > 0 && s.pace < min ? s.pace : min),
    Infinity,
  );
  const slowest = splits.reduce((m, s) => (s.pace > m ? s.pace : m), 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.headerCell, { color: colors.mutedForeground, flex: 0.7 }]}>KM</Text>
        <Text style={[styles.headerCell, { color: colors.mutedForeground, flex: 1.4 }]}>
          PACE {paceUnitLabel(units)}
        </Text>
        <Text style={[styles.headerCell, { color: colors.mutedForeground, flex: 2 }]}>BAR</Text>
      </View>
      {splits.map((split) => {
        const range = Math.max(1, slowest - fastest);
        const widthPercent =
          slowest === fastest ? 1 : 1 - (split.pace - fastest) / range;
        const isFastest = split.pace === fastest;
        return (
          <View key={split.index} style={styles.row}>
            <Text style={[styles.cell, { color: colors.foreground, flex: 0.7, fontFamily: "Inter_700Bold" }]}>
              {split.index}
            </Text>
            <Text
              style={[
                styles.cell,
                {
                  color: isFastest ? tint : colors.foreground,
                  flex: 1.4,
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {formatPace(split.pace, units)}
            </Text>
            <View style={[styles.barWrap, { flex: 2 }]}>
              <View
                style={[
                  styles.barTrack,
                  {
                    backgroundColor:
                      colors.scheme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(11,15,26,0.06)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(0.05, widthPercent) * 100}%`,
                      backgroundColor: isFastest ? tint : colors.foreground,
                      opacity: isFastest ? 1 : 0.55,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
  },
  headerCell: {
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: "Inter_600SemiBold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(127,127,127,0.18)",
  },
  cell: {
    fontSize: 14,
  },
  barWrap: {
    height: 8,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  empty: {
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
});

export default SplitsTable;
