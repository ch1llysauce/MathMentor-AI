import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';

export interface CustomAlertState {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

export default function CustomAlertModal({
  visible,
  title,
  message,
  type = 'error',
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
}: CustomAlertState) {
  const { darkMode } = useTheme();

  if (!visible) return null;

  const getTypeDetails = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle-outline' as const,
          color: '#00a472',
          bg: darkMode ? '#042f1e' : '#d1fae5',
        };
      case 'warning':
        return {
          icon: 'warning-outline' as const,
          color: '#f59e0b',
          bg: darkMode ? '#2d2605' : '#fef3c7',
        };
      case 'info':
        return {
          icon: 'information-circle-outline' as const,
          color: '#4b41e1',
          bg: darkMode ? '#1e1b4b' : '#e0e7ff',
        };
      case 'error':
      default:
        return {
          icon: 'alert-circle-outline' as const,
          color: '#ef4444',
          bg: darkMode ? '#3b1212' : '#fef2f2',
        };
    }
  };

  const details = getTypeDetails();

  const handleClose = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? '#18181b' : '#ffffff',
              borderColor: darkMode ? '#2e2e2e' : '#e0e3e5',
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: details.bg }]}>
            <Ionicons name={details.icon} size={32} color={details.color} />
          </View>

          <Text style={[styles.title, { color: darkMode ? '#ffffff' : '#091426' }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            {secondaryButtonText && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryBtn,
                  { backgroundColor: darkMode ? '#2e2e2e' : '#f1f5f9' },
                ]}
                onPress={onSecondaryPress}
                activeOpacity={0.8}
              >
                <Text style={[styles.secondaryText, { color: darkMode ? '#e2e8f0' : '#475569' }]}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryBtn,
                { backgroundColor: details.color },
                secondaryButtonText ? { flex: 1 } : { width: '100%' },
              ]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flex: 1,
  },
  primaryBtn: {},
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
