import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const currentDebug = `Loading: ${loading}, User: ${user?.displayName || 'none'}, Segments: ${segments.join('/')}`;
    setDebugInfo(currentDebug);
    console.log('📍 Index navigation check:', currentDebug);
    
    if (loading) {
      console.log('⏳ Still loading auth...');
      return;
    }

    // Small delay to ensure auth state is fully propagated
    const navigationTimer = setTimeout(() => {
      // Hide splash screen once auth is determined
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === 'auth';
      const inTabsGroup = segments[0] === '(tabs)';

      if (!user && !inAuthGroup) {
        // Not authenticated and not in auth screens - go to login
        console.log('🔒 No user, redirecting to login...');
        setDebugInfo('Redirecting to login...');
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        // Authenticated but still in auth screens - go to dashboard
        console.log('✅ User authenticated, leaving auth screens...');
        setDebugInfo(`Welcome ${user.displayName}! Redirecting to dashboard...`);
        router.replace('/(tabs)/dashboard');
      } else if (user && !inAuthGroup && !inTabsGroup) {
        // Authenticated and at root - go to dashboard
        console.log('✅ User found at root, going to dashboard...');
        setDebugInfo(`Welcome ${user.displayName}! Loading dashboard...`);
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('✓ Navigation state is correct');
      }
    }, 100); // Small delay to ensure state is updated

    return () => clearTimeout(navigationTimer);
  }, [user, loading, segments]);

  // Show debug info for troubleshooting
  return (
    <View style={styles.container}>
      <Loading />
      <Text style={styles.debug}>{debugInfo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debug: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
