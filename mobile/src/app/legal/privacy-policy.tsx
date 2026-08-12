import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const Section = ({
  title,
  children,
  colors,
}: {
  title: string;
  children: string;
  colors: { title: string; body: string };
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.title }]}>{title}</Text>
    <Text style={[styles.sectionBody, { color: colors.body }]}>{children}</Text>
  </View>
);

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();

  const C = {
    bg:        darkMode ? '#0a0a0a' : '#f7f9fb',
    headerBg:  darkMode ? '#0a0a0a' : '#ffffff',
    border:    darkMode ? '#2e2e2e' : '#e0e3e5',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    icon:      darkMode ? '#f0f0f0' : '#091426',
    headerTitle: darkMode ? '#f0f0f0' : '#091426',
    pageTitle: darkMode ? '#f0f0f0' : '#091426',
    meta:      darkMode ? '#6b6b6b' : '#75777d',
    secTitle:  darkMode ? '#f0f0f0' : '#091426',
    secBody:   darkMode ? '#a0a0a0' : '#45474c',
    footer:    darkMode ? '#6b6b6b' : '#75777d',
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={C.headerBg}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.headerBg, borderBottomColor: C.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.headerTitle }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark" size={40} color="#4b41e1" />
        </View>
        <Text style={[styles.pageTitle, { color: C.pageTitle }]}>Privacy Policy</Text>
        <Text style={[styles.effectiveDate, { color: C.meta }]}>Effective: August 2026 · MathMentor AI</Text>

        <Section title="1. Introduction" colors={{ title: C.secTitle, body: C.secBody }}>
          {`MathMentor AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information about you when you use our application.\n\nBy using MathMentor AI, you agree to the collection and use of information as described in this policy.`}
        </Section>

        <Section title="2. Information We Collect" colors={{ title: C.secTitle, body: C.secBody }}>
          {`We collect the following categories of information:\n\nAccount Information\n• Your name (display name)\n• Email address\n• Password (stored as a secure hash — never in plain text)\n• Grade level and focus areas\n\nLearning Data\n• Quiz and practice question answers\n• Mastery levels per topic and subtopic\n• Diagnostic assessment results and scores\n• Learning path progress and lesson completions\n\nUsage Data\n• Session activity timestamps\n• Study time and streak data\n• Login history and device information (for security)\n• IP address (used for session management only)`}
        </Section>

        <Section title="3. How We Use Your Information" colors={{ title: C.secTitle, body: C.secBody }}>
          {`We use the information we collect to:\n\n• Create and manage your account\n• Personalise your learning path and topic recommendations\n• Track your academic progress over time\n• Power the AI tutor to provide relevant explanations\n• Identify weak areas and suggest focused practice\n• Improve the accuracy and quality of the service\n• Send password reset codes and security alerts\n• Detect and prevent fraudulent or unauthorised access`}
        </Section>

        <Section title="4. Data Storage and Security" colors={{ title: C.secTitle, body: C.secBody }}>
          {`Your data is stored on secure servers provided by MongoDB Atlas (cloud database) and hosted through Render (backend infrastructure).\n\nSecurity measures we apply:\n• Passwords are hashed using bcrypt (one-way encryption)\n• All API communication uses HTTPS/TLS encryption\n• Two-factor authentication secrets are encrypted at rest\n• Login sessions use JWT tokens with expiry limits\n• Session management allows you to revoke access from any device`}
        </Section>

        <Section title="5. Data Sharing" colors={{ title: C.secTitle, body: C.secBody }}>
          {`We do not sell your personal information to third parties.\n\nWe may share data with:\n• Service providers who help us operate the platform (e.g., cloud hosting, AI inference services) — under strict confidentiality obligations\n• Law enforcement or regulatory bodies if required by applicable law\n\nAI Tutoring: MathMentor AI uses a multi-provider AI system. Your tutoring questions are processed by Groq (primary, using Meta's Llama model) with Google Gemini as a fallback. If both are unavailable, responses are generated by our own rule-based system. We do not send your name, email, or account details to AI providers — only the mathematical question content.`}
        </Section>

        <Section title="6. Your Rights" colors={{ title: C.secTitle, body: C.secBody }}>
          {`You have the following rights regarding your personal data:\n\n• Access — You can download a copy of your data at any time from Privacy & Security settings\n• Correction — You can update your profile information in Edit Profile\n• Deletion — You can permanently delete your account and all associated data from Privacy & Security settings\n• Portability — Your exported data is provided in a human-readable format\n\nTo exercise any of these rights, use the in-app options or contact us at support@mathmentor.ai.`}
        </Section>

        <Section title="7. Data Retention" colors={{ title: C.secTitle, body: C.secBody }}>
          {`We retain your data for as long as your account is active. If you delete your account, all personal data — including your profile, progress, and diagnostic results — is permanently deleted from our systems within 30 days.\n\nAnonymised, aggregated data (with no connection to your identity) may be retained for improving the service.`}
        </Section>

        <Section title="8. Children's Privacy" colors={{ title: C.secTitle, body: C.secBody }}>
          {`MathMentor AI is designed for senior high school students. We do not knowingly collect personal information from children under 13 years of age.\n\nIf you are a parent or guardian and believe your child under 13 has created an account, please contact us at support@mathmentor.ai and we will delete the account promptly.`}
        </Section>

        <Section title="9. Cookies and Tracking" colors={{ title: C.secTitle, body: C.secBody }}>
          {`MathMentor AI is a mobile application and does not use browser cookies. We use secure local storage on your device to maintain your login session. This data is stored only on your device and is cleared when you log out.`}
        </Section>

        <Section title="10. Changes to This Policy" colors={{ title: C.secTitle, body: C.secBody }}>
          {`We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. The "Effective" date at the top of this page indicates when the policy was last updated.\n\nYour continued use of MathMentor AI after changes are posted constitutes your acceptance of the updated policy.`}
        </Section>

        <Section title="11. Contact Us" colors={{ title: C.secTitle, body: C.secBody }}>
          {`If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:\n\nEmail: support@mathmentor.ai\n\nWe aim to respond to all privacy-related inquiries within 48 hours.`}
        </Section>

        <Text style={[styles.footer, { color: C.footer }]}>© 2026 MathMentor AI · All rights reserved</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(75,65,225,0.1)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26, fontWeight: '700',
    textAlign: 'center', marginBottom: 6,
  },
  effectiveDate: {
    fontSize: 12, textAlign: 'center', marginBottom: 32,
  },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  sectionBody: { fontSize: 14, lineHeight: 24 },
  footer: { fontSize: 12, textAlign: 'center', marginTop: 16 },
});
