import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface MasteryRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  topic: string;
  subtitle?: string;
  onPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const MasteryRing: React.FC<MasteryRingProps> = ({
  percentage,
  size = 128,
  strokeWidth = 8,
  topic,
  subtitle,
  onPress
}) => {
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

  const content = (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.surfaceContainerHigh}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.secondary}
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
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
      
      <Text style={styles.topic}>{topic}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
