import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';

const GRADE_LEVELS = [9, 10, 11, 12];
const FOCUS_AREAS = [
  { id: 'algebra', label: 'Algebra', icon: 'calculator-outline' },
  { id: 'geometry', label: 'Geometry', icon: 'cube-outline' },
  { id: 'trigonometry', label: 'Trigonometry', icon: 'triangle-outline' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  // Google pre-fill params
  const params = useLocalSearchParams<{
    fromGoogle?: string;
    googleIdToken?: string;
    googleEmail?: string;
    googleName?: string;
    googlePhoto?: string;
  }>();
  const isGoogleFlow = params.fromGoogle === 'true';

  const [displayName, setDisplayName] = useState(params.googleName ?? '');
  const [email, setEmail] = useState(params.googleEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState(9);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusAreas, setFocusAreas] = useState(['algebra', 'geometry']);
  const [loading, setLoading] = useState(false);

  const toggleFocusArea = (areaId: string) => {
    if (focusAreas.includes(areaId)) {
      if (focusAreas.length > 1) {
        setFocusAreas(focusAreas.filter(id => id !== areaId));
      }
    } else {
      setFocusAreas([...focusAreas, areaId]);
    }
  };

  const handleRegister = async () => {
    if (!displayName || (!isGoogleFlow && (!email || !password || !confirmPassword))) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isGoogleFlow) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return;
      }

      // Check password complexity
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        Alert.alert('Error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }
    }

    if (focusAreas.length < 2) {
      Alert.alert('Error', 'Please select at least two focus areas');
      return;
    }

    const mappedFocusAreas = focusAreas.map(id =>
      FOCUS_AREAS.find(area => area.id === id)?.label || id
    );

    setLoading(true);
    try {
      if (isGoogleFlow) {
        // Complete Google registration via dedicated endpoint
        const res = await api.post(AUTH_ENDPOINTS.GOOGLE_REGISTER, {
          idToken: params.googleIdToken,
          gradeLevel,
          focusAreas: mappedFocusAreas,
        });
        const data = res.data;
        if (data.success && data.data) {
          await storage.setItem('token', data.data.token);
          await storage.setItem('user', JSON.stringify(data.data.user));
          setLoading(false);
          router.replace('/(tabs)/dashboard');
        } else {
          Alert.alert('Registration Failed', data.message || 'Registration failed');
          setLoading(false);
        }
        return;
      }

      const response = await register({
        displayName,
        email,
        password,
        gradeLevel,
        focusAreas: mappedFocusAreas,
      });
      
      if (response.success) {
        setLoading(false);
        
        Alert.alert(
          'Success!',
          `Welcome ${displayName}! Your account has been created successfully. Please login to continue.`,
          [
            {
              text: 'Login Now',
              onPress: () => {
                router.replace('/auth/login');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Registration Failed', response.message || 'Registration failed');
        setLoading(false);
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      {/* Ambient Glows */}
      <View style={[styles.ambientGlow, styles.glowTopLeft]} />
      <View style={[styles.ambientGlow, styles.glowBottomRight]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="calculator" size={24} color="#ffffff" />
              </View>
              <Text style={styles.logoText}>MathMentor AI</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              {isGoogleFlow ? 'Almost there!' : 'Complete your student profile'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isGoogleFlow
                ? `Signed in as ${params.googleEmail}. Just set your grade level and focus areas to finish creating your account.`
                : 'Tailor your learning journey by telling us about your current academic level and mathematical focus areas.'}
            </Text>
          </View>

          {/* Main Form */}
          <View style={styles.formCard}>
            {/* Your Identity — hidden for Google flow (name/email come from Google) */}
            {!isGoogleFlow && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Identity</Text>
              <Text style={styles.sectionSubtitle}>Personalize how your mentor and peers see you.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DISPLAY NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Alex Rivera"
                  placeholderTextColor="#75777d"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="alex@example.com"
                  placeholderTextColor="#75777d"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number"
                    placeholderTextColor="#75777d"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#75777d"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#75777d"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#75777d"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            )}

            {/* Grade Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <Text style={styles.sectionSubtitle}>Which grade are you currently attending?</Text>
              
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowGradeDropdown(!showGradeDropdown)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownButtonText}>Grade {gradeLevel}</Text>
                <Ionicons 
                  name={showGradeDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#45474c" 
                />
              </TouchableOpacity>

              {showGradeDropdown && (
                <View style={styles.dropdownMenu}>
                  {GRADE_LEVELS.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.dropdownItem,
                        gradeLevel === grade && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setGradeLevel(grade);
                        setShowGradeDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        gradeLevel === grade && styles.dropdownItemTextSelected,
                      ]}>
                        Grade {grade}
                      </Text>
                      {gradeLevel === grade && (
                        <Ionicons name="checkmark" size={20} color="#4b41e1" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Focus Areas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Focus Areas</Text>
              <Text style={styles.sectionSubtitle}>Select at least two topics you'd like to master first.</Text>
              
              <View style={styles.focusChipsContainer}>
                {FOCUS_AREAS.map((area) => (
                  <TouchableOpacity
                    key={area.id}
                    style={[
                      styles.focusChip,
                      focusAreas.includes(area.id) && styles.focusChipSelected,
                    ]}
                    onPress={() => toggleFocusArea(area.id)}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={area.icon as any} 
                      size={20} 
                      color={focusAreas.includes(area.id) ? '#6ffbbe' : '#191c1e'} 
                    />
                    <Text style={[
                      styles.focusChipText,
                      focusAreas.includes(area.id) && styles.focusChipTextSelected,
                    ]}>
                      {area.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="bulb" size={20} color="#4b41e1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoTextBold}>Why this matters?</Text> Our AI analyzes your grade level to curate problems that align with your school's curriculum standards.
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.ctaSection}>
              <View style={styles.curriculumStatus}>
                <View style={styles.statusIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#00a472" />
                </View>
                <Text style={styles.statusText}>Your curriculum is being generated.</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>
                Already have an account? <Text style={styles.backToLoginBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  ambientGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(75, 65, 225, 0.08)',
    zIndex: -1,
  },
  glowTopLeft: {
    top: -200,
    left: -200,
  },
  glowBottomRight: {
    bottom: -200,
    right: -200,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  header: {
    paddingTop: 75,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#091426',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#091426',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#091426',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#091426',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#45474c',
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 4,
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#45474c',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#45474c',
    letterSpacing: 0.3,
    marginBottom: 8,
    marginLeft: 4,
    lineHeight: 20,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#191c1e',
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#c5c6cd',
    borderRadius: 12,
    lineHeight: 24,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 48,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#c5c6cd',
    borderRadius: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#191c1e',
    lineHeight: 24,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c5c6cd',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  dropdownItemSelected: {
    backgroundColor: '#e2dfff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#191c1e',
    lineHeight: 24,
  },
  dropdownItemTextSelected: {
    color: '#4b41e1',
    fontWeight: '600',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gradeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c5c6cd',
    backgroundColor: '#ffffff',
  },
  gradeCardSelected: {
    borderColor: '#4b41e1',
    backgroundColor: '#e2dfff',
    transform: [{ translateY: -2 }],
  },
  gradeNumber: {
    fontSize: 28,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 4,
    lineHeight: 36,
  },
  gradeNumberSelected: {
    color: '#4b41e1',
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#45474c',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  gradeLabelSelected: {
    color: '#3323cc',
  },
  focusChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#c5c6cd',
    backgroundColor: '#ffffff',
  },
  focusChipSelected: {
    backgroundColor: '#00301e',
    borderColor: '#00a472',
  },
  focusChipText: {
    fontSize: 16,
    color: '#191c1e',
    lineHeight: 24,
  },
  focusChipTextSelected: {
    color: '#6ffbbe',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(226, 223, 255, 0.3)',
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4b41e1',
    marginBottom: 20,
  },
  infoIconContainer: {
    paddingTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#3323cc',
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '700',
  },
  ctaSection: {
    marginBottom: 16,
    gap: 16,
  },
  curriculumStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6ffbbe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#00301e',
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#4b41e1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 28,
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 15,
    color: '#45474c',
  },
  backToLoginBold: {
    color: '#4b41e1',
    fontWeight: '600',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  progressDot: {
    width: 48,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c5c6cd',
  },
  progressDotActive: {
    backgroundColor: '#4edea3',
  },
  progressDotCurrent: {
    backgroundColor: '#4b41e1',
  },
});
