import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const ToggleItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange,
    iconBg,
    iconColor 
  }: { 
    icon: string, 
    title: string, 
    description: string, 
    value: boolean, 
    onValueChange: (value: boolean) => void,
    iconBg: string,
    iconColor: string
  }) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e3e5', true: '#b8b3ff' }}
        thumbColor={value ? '#4b41e1' : '#f2f4f6'}
        ios_backgroundColor="#e0e3e5"
      />
    </View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    value,
    onPress,
    iconBg,
    iconColor 
  }: { 
    icon: string, 
    title: string, 
    value?: string,
    onPress: () => void,
    iconBg: string,
    iconColor: string
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#75777d" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="moon-outline"
              title="Dark Mode"
              description="Use dark theme throughout the app"
              value={darkMode}
              onValueChange={toggleDarkMode}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
          </View>
        </View>

        {/* Interface */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interface</Text>
          <View style={styles.menuList}>
            <MenuItem
              icon="language-outline"
              title="Language"
              value="English"
              onPress={() => {
                Alert.alert('Language', 'Choose your preferred language:', [
                  { text: 'English' },
                  { text: 'Spanish' },
                  { text: 'French' },
                  { text: 'German' },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
              iconBg="rgba(33, 150, 243, 0.1)"
              iconColor="#2196f3"
            />
            <MenuItem
              icon="text-outline"
              title="Font Size"
              value="Medium"
              onPress={() => {
                Alert.alert('Font Size', 'Choose your preferred font size:', [
                  { text: 'Small' },
                  { text: 'Medium' },
                  { text: 'Large' },
                  { text: 'Extra Large' },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
          </View>
        </View>

        {/* Sound & Haptics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Haptics</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="volume-high-outline"
              title="Sound Effects"
              description="Play sounds for interactions"
              value={soundEffects}
              onValueChange={setSoundEffects}
              iconBg="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
            <ToggleItem
              icon="phone-portrait-outline"
              title="Haptic Feedback"
              description="Vibrate on button taps"
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
          </View>
        </View>

        {/* Learning Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Preferences</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="play-circle-outline"
              title="Auto-Play Videos"
              description="Automatically play lesson videos"
              value={autoPlay}
              onValueChange={setAutoPlay}
              iconBg="rgba(0, 164, 114, 0.1)"
              iconColor="#00a472"
            />
          </View>
          <View style={styles.menuList}>
            <MenuItem
              icon="timer-outline"
              title="Session Duration"
              value="30 minutes"
              onPress={() => {
                Alert.alert('Session Duration', 'Choose your preferred study session length:', [
                  { text: '15 minutes' },
                  { text: '30 minutes' },
                  { text: '45 minutes' },
                  { text: '60 minutes' },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
            <MenuItem
              icon="calendar-outline"
              title="Study Schedule"
              value="Not set"
              onPress={() => Alert.alert('Study Schedule', 'Set your preferred study times coming soon!')}
              iconBg="rgba(0, 164, 114, 0.1)"
              iconColor="#00a472"
            />
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="cloud-upload-outline"
              title="Auto Sync"
              description="Sync your progress automatically"
              value={dataSync}
              onValueChange={setDataSync}
              iconBg="rgba(33, 150, 243, 0.1)"
              iconColor="#2196f3"
            />
            <ToggleItem
              icon="cloud-offline-outline"
              title="Offline Mode"
              description="Download lessons for offline use"
              value={offlineMode}
              onValueChange={setOfflineMode}
              iconBg="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
          </View>
          <View style={styles.menuList}>
            <MenuItem
              icon="server-outline"
              title="Storage Used"
              value="124 MB"
              onPress={() => {
                Alert.alert(
                  'Storage',
                  'App Storage: 124 MB\n\n' +
                  'Downloaded Lessons: 85 MB\n' +
                  'Cache: 39 MB\n\n' +
                  'Clear cache to free up space?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear Cache', onPress: () => Alert.alert('Success', 'Cache cleared successfully') }
                  ]
                );
              }}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
          </View>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.menuList}>
            <MenuItem
              icon="bug-outline"
              title="Report a Problem"
              onPress={() => Alert.alert('Report Problem', 'Describe the issue you encountered and we\'ll look into it.')}
              iconBg="rgba(186, 26, 26, 0.1)"
              iconColor="#ba1a1a"
            />
            <MenuItem
              icon="refresh-outline"
              title="Reset Settings"
              onPress={() => {
                Alert.alert(
                  'Reset Settings',
                  'This will reset all settings to default. Your learning progress will not be affected.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Success', 'Settings reset to default') }
                  ]
                );
              }}
              iconBg="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
            <MenuItem
              icon="code-slash-outline"
              title="Developer Mode"
              value="Off"
              onPress={() => Alert.alert('Developer Mode', 'Enable developer mode for advanced features and debugging.')}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
          <Text style={styles.infoLabel}>Build Number</Text>
          <Text style={styles.infoValue}>2024.01.001</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 12,
  },
  toggleList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#091426',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#75777d',
  },
  menuList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#091426',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: '#75777d',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#75777d',
    marginBottom: 4,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#091426',
  },
});
