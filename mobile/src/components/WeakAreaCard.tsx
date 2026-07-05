import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';

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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtopic}>{subtopic}</Text>
          <Text style={styles.percentage}>{masteryPercentage}% Mastery</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${masteryPercentage}%` }
            ]}
          />
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>REVIEW NOW</Text>
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
  pressed: {
    backgroundColor: Colors.surfaceContainerLow,
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
    color: Colors.text,
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
    backgroundColor: Colors.surfaceContainerHigh,
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
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
});
