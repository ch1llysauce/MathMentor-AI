import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const APP_VERSION = '1.0.0';

const FEATURES = [
  { icon: 'analytics-outline', label: 'Diagnostic Assessment', desc: 'Pinpoints your strengths and gaps across Algebra, Geometry, and Trigonometry.' },
  { icon: 'map-outline', label: 'Personalised Learning Path', desc: 'AI-generated study plans that adapt as your skills improve.' },
  { icon: 'chatbubble-ellipses-outline', label: 'AI Tutor', desc: 'Ask anything — get step-by-step explanations in real time.' },
  { icon: 'bar-chart-outline', label: 'Progress Tracking', desc: 'Mastery levels, streaks, and accuracy across every topic.' },
];

export default function AboutScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();

  const C = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    primary: darkMode ? '#a5b4fc' : '#4b41e1',
    primaryBg: darkMode ? 'rgba(165,180,252,0.12)' : 'rgba(75,65,225,0.08)',
    iconBg: darkMode ? '#242424' : '#f2f4f6',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    linkText: darkMode ? '#a5b4fc' : '#4b41e1',
    mutedBorder: darkMode ? '#2e2e2e' : '#e2e8f0',
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.header, borderBottomColor: C.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* App identity */}
        <View style={[styles.heroCard, { backgroundColor: C.primaryBg, borderColor: C.mutedBorder }]}>
          <View style={[styles.appIcon, { backgroundColor: C.primary }]}>
            <Ionicons name="calculator" size={32} color="#ffffff" />
          </View>
          <Text style={[styles.appName, { color: C.text }]}>MathMentor AI</Text>
          <Text style={[styles.appVersion, { color: C.textLight }]}>Version {APP_VERSION}</Text>
          <Text style={[styles.appTagline, { color: C.textLight }]}>
            Your personalised AI-powered mathematics tutor for high school students.
          </Text>
        </View>

        {/* What we do */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>What MathMentor AI does</Text>
          <Text style={[styles.bodyText, { color: C.textLight }]}>
            MathMentor AI combines a diagnostic assessment, adaptive learning paths, and a conversational AI tutor to help
            students build genuine mastery in mathematics — at their own pace, on their own schedule.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Core features</Text>
          <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
            {FEATURES.map((f, i) => (
              <View key={f.label} style={[styles.featureRow, i < FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: C.iconBg }]}>
                  <Ionicons name={f.icon as any} size={20} color={C.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureLabel, { color: C.text }]}>{f.label}</Text>
                  <Text style={[styles.featureDesc, { color: C.textLight }]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Legal links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Legal</Text>
          <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 1, borderBottomColor: C.border }]} onPress={() => router.push('/legal/terms')} activeOpacity={0.7}>
              <Text style={[styles.linkText, { color: C.text }]}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/legal/privacy-policy')} activeOpacity={0.7}>
              <Text style={[styles.linkText, { color: C.text }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <Text style={[styles.copyright, { color: C.textLight }]}>
          © {new Date().getFullYear()} MathMentor AI. All rights reserved.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  scrollContent: { padding: 16 },
  heroCard: {
    alignItems: 'center', padding: 28, borderRadius: 20,
    borderWidth: 1, marginBottom: 24, gap: 6,
  },
  appIcon: {
    width: 68, height: 68, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  appName: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  appVersion: { fontSize: 13 },
  appTagline: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4, paddingHorizontal: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, paddingHorizontal: 2 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, gap: 2 },
  featureLabel: { fontSize: 14, fontWeight: '600' },
  featureDesc: { fontSize: 13, lineHeight: 18 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
  },
  linkText: { fontSize: 15, fontWeight: '500' },
  copyright: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
