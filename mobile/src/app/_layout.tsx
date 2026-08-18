import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, ScaledText as Text, useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

function SessionRevokedModal() {
  const { sessionRevoked, dismissSessionRevoked } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();

  if (!sessionRevoked) return null;

  const bg = darkMode ? '#1a1a1a' : '#ffffff';
  const textColor = darkMode ? '#f0f0f0' : '#091426';
  const subtextColor = darkMode ? '#a0a0a0' : '#75777d';
  const borderColor = darkMode ? '#2e2e2e' : '#e0e3e5';

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.card, { backgroundColor: bg, borderColor }]}>
          <View style={[modalStyles.iconBox, { backgroundColor: 'rgba(255,152,0,0.1)' }]}>
            <Ionicons name="shield-outline" size={30} color="#ff9800" />
          </View>
          <Text style={[modalStyles.title, { color: textColor }]}>Session Ended</Text>
          <Text style={[modalStyles.subtitle, { color: subtextColor }]}>
            You have been signed out of this device by another active session. If this wasn't you, please sign in and change your password immediately.
          </Text>
          <TouchableOpacity
            style={modalStyles.button}
            activeOpacity={0.8}
            onPress={() => {
              dismissSessionRevoked();
              router.replace('/auth/login');
            }}
          >
            <Text style={modalStyles.buttonText}>Sign In Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay to allow auth check
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="legal/terms" />
          <Stack.Screen name="legal/privacy-policy" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/faq" />
          <Stack.Screen name="profile/about" />
          <Stack.Screen name="practice/lesson-chat" />
        </Stack>
        <SessionRevokedModal />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

