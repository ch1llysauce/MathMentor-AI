import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import Loading from '@/components/common/Loading';

export default function DashboardScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready
    if (!loading) {
      if (!user) {
        // No user found, redirect to login
        router.replace('/auth/login');
        return;
      }
      setIsReady(true);
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading || !isReady || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.displayName}!</Text>
        <Text style={styles.subtitle}>Ready to learn math today?</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Dashboard Screen</Text>
        <Text style={styles.subtext}>More features coming soon...</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutButton: {
    margin: 24,
    height: 48,
    backgroundColor: Colors.error,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
