import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface TimelineDataPoint {
  date: string;
  score: number;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
  height?: number;
}

// Fixed Y-axis ticks (always 0–100 since scores are percentages)
const Y_TICKS = [100, 75, 50, 25, 0];
const Y_AXIS_WIDTH = 32;   // px for tick-number column
const Y_TITLE_WIDTH = 16;  // px for the rotated axis-title column
const X_TITLE_HEIGHT = 20; // px for the x-axis title row

export const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  height = 256,
}) => {
  const { primaryColor } = useTheme();
  // Height used for the bar area (date labels already sit inside the 40 px bottom padding)
  const chartHeight = height - 40;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.outerColumn, { height: height + X_TITLE_HEIGHT }]}>
        <Text style={styles.noData}>No timeline data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerColumn}>
      {/* ── Row: rotated Y-title + tick numbers + bars ─────────────── */}
      <View style={[styles.chartRow, { height }]}>

        {/* Rotated Y-axis title */}
        <View style={[styles.yTitleContainer, { width: Y_TITLE_WIDTH, height: chartHeight }]}>
          <Text style={styles.yTitle}>Mastery Score (%)</Text>
        </View>

        {/* Tick-number column */}
        <View style={[styles.yAxis, { height: chartHeight, width: Y_AXIS_WIDTH }]}>
          {Y_TICKS.map((tick) => {
            const topOffset = ((100 - tick) / 100) * chartHeight;
            return (
              <Text key={tick} style={[styles.yLabel, { top: topOffset - 7 }]}>
                {tick}
              </Text>
            );
          })}
        </View>

        {/* Scrollable bar area */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollArea}
        >
          <View style={[styles.chartArea, { height }]}>
            {/* Gridlines */}
            {Y_TICKS.map((tick) => {
              const topOffset = ((100 - tick) / 100) * chartHeight;
              return (
                <View
                  key={tick}
                  style={[
                    styles.gridLine,
                    { top: topOffset },
                    tick === 0 && styles.gridLineBaseline,
                  ]}
                />
              );
            })}

            {/* Bars */}
            <View style={[styles.barsContainer, { paddingBottom: 40 }]}>
              {data.map((point, index) => {
                const barHeightPct = Math.min(point.score, 100);
                const getBarColor = (score: number) => {
                  if (score >= 100) return primaryColor || Colors.secondary;
                  if (score >= 70) return '#00a472';
                  if (score >= 40) return '#f59e0b';
                  return '#ef4444';
                };
                const barColor = getBarColor(point.score);
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: `${barHeightPct}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.dateLabel}>{point.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ── X-axis title row ────────────────────────────────────────── */}
      <View style={[styles.xTitleRow, { height: X_TITLE_HEIGHT, paddingLeft: Y_TITLE_WIDTH + Y_AXIS_WIDTH + 4 }]}>
        <Text style={styles.xTitle}>Date</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Outer column wraps chart row + x-axis title
  outerColumn: {
    flexDirection: 'column',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // ── Y-axis title ────────────────────────────────────────────────────
  yTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  yTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.3,
    // Rotate so text reads bottom-to-top
    transform: [{ rotate: '-90deg' }],
    // Width must be set to the *height* we want after rotation so it fits in the column
    width: 120,
    textAlign: 'center',
  },

  // ── Tick numbers ────────────────────────────────────────────────────
  yAxis: {
    position: 'relative',
    marginRight: 4,
  },
  yLabel: {
    position: 'absolute',
    right: 2,
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textLight,
    width: Y_AXIS_WIDTH,
    textAlign: 'right',
  },

  // ── Bar / scroll area ───────────────────────────────────────────────
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  chartArea: {
    flex: 1,
    minWidth: '100%',
    position: 'relative',
    paddingHorizontal: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  gridLineBaseline: {
    backgroundColor: Colors.outlineVariant,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textLight,
    marginTop: 16,
    textAlign: 'center',
  },

  // ── X-axis title ────────────────────────────────────────────────────
  xTitleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  xTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.3,
  },

  noData: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.textLight,
    fontSize: 16,
  },
});
