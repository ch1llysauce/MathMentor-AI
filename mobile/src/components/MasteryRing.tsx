import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface MasteryRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  topic: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const MasteryRing: React.FC<MasteryRingProps> = ({
  percentage,
  size = 128,
  strokeWidth = 8,
  topic,
  subtitle,
  color,
  onPress
}) => {
  const { darkMode } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const defaultColor =
    topic === 'Algebra' ? '#2563eb' :
    topic === 'Geometry' ? '#00a472' :
    topic === 'Trigonometry' ? '#f59e0b' :
    (percentage >= 80 ? '#00a472' : percentage >= 60 ? '#f59e0b' : '#ef4444');

  const ringColor = color || defaultColor;

  const trackColor = darkMode ? '#2e2e2e' : '#f3f4f6';
  const percentageColor = ringColor;
  const topicColor = darkMode ? '#f0f0f0' : Colors.text;
  const subtitleColor = darkMode ? '#a0a0a0' : Colors.textLight;

  const isSmall = size < 100;
  const percentageFontSize = isSmall ? 15 : 20;
  const topicFontSize = isSmall ? 13 : 18;
  const subtitleFontSize = isSmall ? 11 : 13;
  const ringMarginBottom = isSmall ? 8 : 16;

  const content = (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size, marginBottom: ringMarginBottom }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: percentageColor, fontSize: percentageFontSize }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
      
      <Text style={[styles.topic, { color: topicColor, fontSize: topicFontSize }]} numberOfLines={1}>
        {topic}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: subtitleColor, fontSize: subtitleFontSize }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  topic: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});
