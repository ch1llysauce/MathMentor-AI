import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface WeakAreaCardProps {
  subtopic: string;
  masteryPercentage: number;
  onPress?: () => void;
}

export const WeakAreaCard: React.FC<WeakAreaCardProps> = ({
  subtopic,
  masteryPercentage,
  onPress
}) => {
  const { darkMode } = useTheme();

  const textColor = darkMode ? '#f0f0f0' : Colors.text;
  const trackColor = darkMode ? '#2e2e2e' : Colors.surfaceContainerHigh;
  const pressedBg  = darkMode ? '#1e1e1e' : Colors.surfaceContainerLow;
  const reviewColor = darkMode ? '#a5b4fc' : Colors.secondary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: pressedBg }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.subtopic, { color: textColor }]}>{subtopic}</Text>
          <Text style={styles.percentage}>{masteryPercentage}% Mastery</Text>
        </View>
        
        <View style={[styles.progressBarContainer, { backgroundColor: trackColor }]}>
          <View style={[styles.progressBar, { width: `${masteryPercentage}%` }]} />
        </View>
        
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={[styles.actionText, { color: reviewColor }]}>REVIEW NOW</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtopic: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.error,
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.error,
    borderRadius: 3,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    opacity: 0.7,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
