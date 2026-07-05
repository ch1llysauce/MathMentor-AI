import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

interface TimelineDataPoint {
  date: string;
  score: number;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
  height?: number;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  height = 256
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No timeline data available</Text>
      </View>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score), 100);
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.container, { height }]}>
        {/* Gridlines */}
        <View style={styles.gridLineTop} />
        <View style={styles.gridLineMiddle} />
        <View style={styles.gridLineBottom} />
        
        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((point, index) => {
            const barHeight = (point.score / maxScore) * 100;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barBackground,
                      { height: `${barHeight}%` }
                    ]}
                  >
                    <View style={styles.bar} />
                  </View>
                </View>
                <Text style={styles.label}>{point.date}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    minWidth: '100%',
    position: 'relative',
    paddingHorizontal: 8,
  },
  gridLineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  gridLineMiddle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  gridLineBottom: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 40,
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
  barBackground: {
    width: '100%',
    backgroundColor: `${Colors.secondary}1A`,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-end',
    padding: 2,
  },
  bar: {
    width: '100%',
    height: '66.67%',
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textLight,
    marginTop: 16,
    textAlign: 'center',
  },
  noData: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.textLight,
    fontSize: 16,
  },
});
