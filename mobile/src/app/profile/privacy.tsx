import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [allowMessages, setAllowMessages] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

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
    description, 
    onPress,
    iconBg,
    iconColor 
  }: { 
    icon: string, 
    title: string, 
    description: string, 
    onPress: () => void,
    iconBg: string,
    iconColor: string
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#75777d" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="eye-outline"
              title="Profile Visibility"
              description="Allow others to see your profile"
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
            <ToggleItem
              icon="stats-chart-outline"
              title="Show Progress"
              description="Display your learning progress publicly"
              value={showProgress}
              onValueChange={setShowProgress}
              iconBg="rgba(0, 164, 114, 0.1)"
              iconColor="#00a472"
            />
            <ToggleItem
              icon="chatbubble-outline"
              title="Allow Messages"
              description="Let other learners message you"
              value={allowMessages}
              onValueChange={setAllowMessages}
              iconBg="rgba(33, 150, 243, 0.1)"
              iconColor="#2196f3"
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <View style={styles.toggleList}>
            <ToggleItem
              icon="finger-print-outline"
              title="Biometric Authentication"
              description="Use fingerprint or face ID to login"
              value={biometricAuth}
              onValueChange={(value) => {
                if (value) {
                  Alert.alert(
                    'Enable Biometric Auth',
                    'This will enable fingerprint or face ID authentication for faster login.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Enable', onPress: () => setBiometricAuth(true) }
                    ]
                  );
                } else {
                  setBiometricAuth(false);
                }
              }}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
            <ToggleItem
              icon="shield-checkmark-outline"
              title="Two-Factor Authentication"
              description="Extra security for your account"
              value={twoFactorAuth}
              onValueChange={(value) => {
                if (value) {
                  Alert.alert(
                    'Enable 2FA',
                    'You will need to verify your identity using a code sent to your email or phone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Set Up', onPress: () => setTwoFactorAuth(true) }
                    ]
                  );
                } else {
                  Alert.alert(
                    'Disable 2FA',
                    'This will reduce your account security. Are you sure?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Disable', style: 'destructive', onPress: () => setTwoFactorAuth(false) }
                    ]
                  );
                }
              }}
              iconBg="rgba(0, 164, 114, 0.1)"
              iconColor="#00a472"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.menuList}>
            <MenuItem
              icon="download-outline"
              title="Download My Data"
              description="Get a copy of your data"
              onPress={() => Alert.alert('Download Data', 'Your data will be prepared and sent to your email within 24 hours.')}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
            <MenuItem
              icon="document-text-outline"
              title="Data Usage Policy"
              description="How we use your information"
              onPress={() => Alert.alert('Data Policy', 'View our data usage policy in the help center.')}
              iconBg="rgba(33, 150, 243, 0.1)"
              iconColor="#2196f3"
            />
            <MenuItem
              icon="trash-outline"
              title="Delete My Data"
              description="Permanently remove your data"
              onPress={() => {
                Alert.alert(
                  'Delete Data',
                  'This will permanently delete all your learning data. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => {} }
                  ]
                );
              }}
              iconBg="rgba(186, 26, 26, 0.1)"
              iconColor="#ba1a1a"
            />
          </View>
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Management</Text>
          <View style={styles.menuList}>
            <MenuItem
              icon="phone-portrait-outline"
              title="Active Sessions"
              description="Manage devices logged into your account"
              onPress={() => Alert.alert('Active Sessions', 'You have 2 active sessions:\n\n• iPhone 13 (Current)\n• iPad Pro')}
              iconBg="rgba(75, 65, 225, 0.1)"
              iconColor="#4b41e1"
            />
            <MenuItem
              icon="log-out-outline"
              title="Sign Out All Devices"
              description="Log out from all other devices"
              onPress={() => {
                Alert.alert(
                  'Sign Out All',
                  'This will sign you out from all devices except this one.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', style: 'destructive', onPress: () => Alert.alert('Success', 'Signed out from all other devices') }
                  ]
                );
              }}
              iconBg="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
          </View>
        </View>

        {/* Security Shield Card */}
        <View style={styles.securityCard}>
          <View style={styles.securityIconContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#00a472" />
          </View>
          <Text style={styles.securityTitle}>Your Account is Secure</Text>
          <Text style={styles.securityDescription}>
            We use industry-standard encryption to protect your data and privacy
          </Text>
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
    marginRight: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#091426',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#75777d',
  },
  securityCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  securityIconContainer: {
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#091426',
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: '#75777d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
