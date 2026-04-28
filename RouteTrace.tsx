import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

type Coord = { latitude: number; longitude: number };

type Props = {
  points: Coord[];
  height?: number;
  accent?: string;
  style?: ViewStyle;
  showCompass?: boolean;
};

function buildPath(points: Coord[], width: number, height: number, padding = 18) {
  if (points.length === 0) return "";
  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const spanLat = Math.max(0.0001, maxLat - minLat);
  const spanLon = Math.max(0.0001, maxLon - minLon);

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / spanLon, innerH / spanLat);
  const offsetX = (innerW - spanLon * scale) / 2 + padding;
  const offsetY = (innerH - spanLat * scale) / 2 + padding;

  return points
    .map((p, i) => {
      const x = (p.longitude - minLon) * scale + offsetX;
      const y = innerH - (p.latitude - minLat) * scale + offsetY - innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${(y + innerH).toFixed(2)}`;
    })
    .join(" ");
}

export function RouteTrace({
  points,
  height = 220,
  accent,
  style,
  showCompass = true,
}: Props) {
  const colors = useColors();
  const tint = accent ?? colors.primary;
  const [layout, setLayout] = React.useState({ width: 0, height });
  const path = buildPath(points, layout.width || 320, height);
  const start = points[0];
  const end = points[points.length - 1];

  const startEnd = React.useMemo(() => {
    if (!points.length || !layout.width) return null;
    const lats = points.map((p) => p.latitude);
    const lons = points.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const spanLat = Math.max(0.0001, maxLat - minLat);
    const spanLon = Math.max(0.0001, maxLon - minLon);
    const padding = 18;
    const innerW = layout.width - padding * 2;
    const innerH = height - padding * 2;
    const scale = Math.min(innerW / spanLon, innerH / spanLat);
    const offsetX = (innerW - spanLon * scale) / 2 + padding;
    const offsetY = (innerH - spanLat * scale) / 2 + padding;
    const project = (p: Coord) => ({
      x: (p.longitude - minLon) * scale + offsetX,
      y: innerH - (p.latitude - minLat) * scale + offsetY,
    });
    return { start: project(start!), end: project(end!) };
  }, [points, layout.width, height, start, end]);

  return (
    <View
      style={[
        styles.wrap,
        {
          height,
          backgroundColor: colors.elevated,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
        style,
      ]}
      onLayout={(e) =>
        setLayout({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      <LinearGradient
        colors={
          colors.scheme === "dark"
            ? ["rgba(255,255,255,0.04)", "rgba(255,255,255,0)"]
            : ["rgba(11,15,26,0.04)", "rgba(11,15,26,0)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Grid lines */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { padding: 0, opacity: colors.scheme === "dark" ? 0.18 : 0.12 },
        ]}
        pointerEvents="none"
      >
        {layout.width > 0 ? (
          <Svg width={layout.width} height={height}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Path
                key={`v-${i}`}
                d={`M${(layout.width / 6) * i},0 L${(layout.width / 6) * i},${height}`}
                stroke={colors.foreground}
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <Path
                key={`h-${i}`}
                d={`M0,${(height / 4) * i} L${layout.width},${(height / 4) * i}`}
                stroke={colors.foreground}
                strokeWidth={0.5}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      {layout.width > 0 && points.length > 1 ? (
        <Svg width={layout.width} height={height}>
          <Defs>
            <SvgLinearGradient id="trace" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={tint} stopOpacity={0.5} />
              <Stop offset="1" stopColor={tint} stopOpacity={1} />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={path}
            stroke="url(#trace)"
            strokeWidth={4}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {startEnd ? (
            <>
              <Circle cx={startEnd.start.x} cy={startEnd.start.y} r={6} fill={colors.background} />
              <Circle cx={startEnd.start.x} cy={startEnd.start.y} r={4} fill={tint} />
              <Circle cx={startEnd.end.x} cy={startEnd.end.y} r={7} fill={tint} />
              <Circle cx={startEnd.end.x} cy={startEnd.end.y} r={3} fill={colors.background} />
            </>
          ) : null}
        </Svg>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="navigate-outline" size={24} color={colors.mutedForeground} />
          <Text
            style={{
              color: colors.mutedForeground,
              marginTop: 6,
              fontSize: 12,
              fontFamily: "Inter_500Medium",
            }}
          >
            No route recorded yet
          </Text>
        </View>
      )}

      {showCompass ? (
        <View style={[styles.compass, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="navigate" size={14} color={colors.foreground} />
          <Text
            style={{
              color: colors.foreground,
              fontSize: 11,
              fontFamily: "Inter_700Bold",
              marginLeft: 4,
            }}
          >
            N
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  compass: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default RouteTrace;
