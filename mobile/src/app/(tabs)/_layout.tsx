import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions, Text as RNText, Modal, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { useCalculatorContext } from '@/context/CalculatorContext';
import ScientificCalculator from '@/components/ScientificCalculator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INITIAL_X = SCREEN_WIDTH - 64;
const INITIAL_Y = SCREEN_HEIGHT - 160;

export default function TabsLayout() {
  const { darkMode, primaryColor } = useTheme();
  const { fabDismissed, setFabDismissed, calcVisible, setCalcVisible, resetTrigger } = useCalculatorContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);

  const tabBarBg = darkMode ? '#0a0a0a' : '#ffffff';
  const activeColor = primaryColor;
  const inactiveColor = darkMode ? '#666666' : Colors.textLight;

  const dropZoneCircleRef = useRef<View>(null);
  const dropZoneCenterRef = useRef({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 125 });

  const measureDropZone = () => {
    dropZoneCircleRef.current?.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) {
        dropZoneCenterRef.current = {
          x: x + w / 2,
          y: y + h / 2,
        };
      }
    });
  };

  // Draggable Floating Chathead state
  const pan = useRef(new Animated.ValueXY({ x: INITIAL_X, y: INITIAL_Y })).current;

  // Reset chathead to original position when restored
  useEffect(() => {
    pan.setOffset({ x: 0, y: 0 });
    pan.setValue({ x: INITIAL_X, y: INITIAL_Y });
  }, [resetTrigger]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        measureDropZone();
        const centerX = dropZoneCenterRef.current.x;
        const centerY = dropZoneCenterRef.current.y;
        const dist = Math.hypot(gestureState.moveX - centerX, gestureState.moveY - centerY);

        // Turned red ONLY when chathead center is inside or touching the drop zone circle (radius 48px)
        const isInsideCircle = dist < 48;
        setIsHoveringDropZone(isInsideCircle);

        // Clamp chathead within screen boundaries while dragging
        const { width: currentW, height: currentH } = Dimensions.get('window');
        const MARGIN_X = 12;
        const MIN_X = MARGIN_X;
        const MAX_X = currentW - 48 - MARGIN_X;
        const MIN_Y = 48; // below status bar
        const MAX_Y = currentH - 48 - 85; // above bottom navigation tab bar

        const rawX = (pan.x as any)._offset + gestureState.dx;
        const rawY = (pan.y as any)._offset + gestureState.dy;

        const clampedX = Math.max(MIN_X, Math.min(MAX_X, rawX));
        const clampedY = Math.max(MIN_Y, Math.min(MAX_Y, rawY));

        pan.x.setValue(clampedX - (pan.x as any)._offset);
        pan.y.setValue(clampedY - (pan.y as any)._offset);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        setIsHoveringDropZone(false);
        pan.flattenOffset();

        // 1. Check if user simply tapped (movement < 6px) -> OPEN CALCULATOR
        const isTap = Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6;
        if (isTap) {
          setCalcVisible(true);
          return;
        }

        // 2. Check if released inside or touching the drop zone circle
        measureDropZone();
        const centerX = dropZoneCenterRef.current.x;
        const centerY = dropZoneCenterRef.current.y;
        const dist = Math.hypot(gestureState.moveX - centerX, gestureState.moveY - centerY);

        if (dist < 48) {
          setFabDismissed(true);
          setShowDismissModal(true);
          return;
        }

        // 3. Smooth spring / snap back inside safe screen boundaries if released past bounds
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        const { width: currentW, height: currentH } = Dimensions.get('window');
        const MARGIN_X = 12;
        const MIN_X = MARGIN_X;
        const MAX_X = currentW - 48 - MARGIN_X;
        const MIN_Y = 48;
        const MAX_Y = currentH - 48 - 85;

        const finalX = Math.max(MIN_X, Math.min(MAX_X, currentX));
        const finalY = Math.max(MIN_Y, Math.min(MAX_Y, currentY));

        if (finalX !== currentX || finalY !== currentY) {
          Animated.spring(pan, {
            toValue: { x: finalX, y: finalY },
            useNativeDriver: false,
            friction: 7,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: tabBarBg,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Practice',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="diagnostic"
          options={{
            title: 'Diagnostic',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="clipboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tutor"
          options={{
            title: 'Tutor',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Chathead Bottom Drop Target (✖) - Appears while dragging */}
      {isDragging && !fabDismissed && (
        <View style={styles.dropZoneContainer} pointerEvents="none">
          <View
            ref={dropZoneCircleRef}
            onLayout={measureDropZone}
            style={[
              styles.dropZoneCircle,
              isHoveringDropZone && styles.dropZoneCircleHover,
            ]}
          >
            <Ionicons name="close" size={isHoveringDropZone ? 28 : 24} color="#ffffff" />
          </View>
          <RNText style={styles.dropZoneLabel}>
            {isHoveringDropZone ? 'Release to Dismiss' : 'Drag here to close'}
          </RNText>
        </View>
      )}

      {/* Global Draggable Floating Calculator Chathead */}
      {!fabDismissed && (
        <Animated.View
          style={[
            styles.fab,
            {
              transform: pan.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.fabInner, { backgroundColor: primaryColor || '#4b41e1', shadowColor: primaryColor || '#4b41e1' }]}>
            <Ionicons name="calculator" size={24} color="#ffffff" />
          </View>
        </Animated.View>
      )}

      <ScientificCalculator
        visible={calcVisible}
        onClose={() => setCalcVisible(false)}
        darkMode={darkMode}
        showUseResult={false}
      />

      {/* Custom Notification Modal when Chathead is Dismissed */}
      <Modal
        visible={showDismissModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDismissModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#161616' : '#ffffff' }]}>
            <View
              style={[
                styles.modalIconBox,
                {
                  backgroundColor: `${primaryColor || '#4b41e1'}20`,
                  borderColor: `${primaryColor || '#4b41e1'}40`,
                },
              ]}
            >
              <Ionicons name="calculator-outline" size={32} color={primaryColor || '#4b41e1'} />
            </View>

            <RNText style={[styles.modalTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
              Calculator Hidden
            </RNText>

            <RNText style={[styles.modalMessage, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
              You can restore the floating scientific calculator icon anytime from your Profile screen.
            </RNText>

            <TouchableOpacity
              onPress={() => setShowDismissModal(false)}
              style={[styles.modalConfirmBtn, { backgroundColor: primaryColor || '#4b41e1', shadowColor: primaryColor || '#4b41e1' }]}
              activeOpacity={0.8}
            >
              <RNText style={styles.modalConfirmBtnText}>Got It</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    zIndex: 999,
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  dropZoneContainer: {
    position: 'absolute',
    bottom: 95,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  dropZoneCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  dropZoneCircleHover: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ef4444',
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  dropZoneLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  /* Notification Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  modalConfirmBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
