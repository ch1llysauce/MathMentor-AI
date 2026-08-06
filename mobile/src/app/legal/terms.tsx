import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Section = ({ title, children }: { title: string; children: string }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionBody}>{children}</Text>
  </View>
);

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Ionicons name="document-text" size={40} color="#4b41e1" />
        </View>
        <Text style={styles.pageTitle}>Terms of Service</Text>
        <Text style={styles.effectiveDate}>Effective: January 2025 · MathMentor AI</Text>

        <Section title="1. Acceptance of Terms">
          {`By accessing or using MathMentor AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.\n\nThese terms apply to all users of the app, including students, educators, and any other individuals who access our services.`}
        </Section>

        <Section title="2. Description of Service">
          {`MathMentor AI is a personalised mathematics learning platform designed for senior high school students. The service includes:\n\n• Adaptive diagnostic assessments\n• Personalised learning paths\n• AI-powered tutoring and explanations\n• Practice problems and progress tracking\n• Topic-based lessons in Algebra, Geometry, and Trigonometry`}
        </Section>

        <Section title="3. User Accounts">
          {`To use MathMentor AI, you must create an account. You are responsible for:\n\n• Providing accurate and complete registration information\n• Maintaining the security of your password\n• All activities that occur under your account\n• Notifying us immediately of any unauthorised use\n\nYou must be at least 13 years old to create an account. Users under 18 should have parental or guardian consent.`}
        </Section>

        <Section title="4. Acceptable Use">
          {`You agree not to use MathMentor AI to:\n\n• Violate any applicable laws or regulations\n• Attempt to gain unauthorised access to any part of the service\n• Share your account credentials with others\n• Submit false or misleading information\n• Interfere with or disrupt the service's functionality\n• Reverse engineer or attempt to extract the source code`}
        </Section>

        <Section title="5. Intellectual Property">
          {`All content within MathMentor AI — including lessons, questions, explanations, graphics, and software — is the intellectual property of MathMentor AI and is protected by copyright law.\n\nYou are granted a limited, non-exclusive, non-transferable licence to use the service for personal educational purposes only. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.`}
        </Section>

        <Section title="6. AI-Generated Content">
          {`MathMentor AI uses artificial intelligence to generate explanations, hints, and tutoring responses. While we strive for accuracy, AI-generated content may occasionally contain errors.\n\nWe do not guarantee the accuracy, completeness, or suitability of AI-generated content for any particular purpose. Always verify important mathematical concepts with your teacher or textbook.`}
        </Section>

        <Section title="7. Privacy">
          {`Your use of MathMentor AI is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.`}
        </Section>

        <Section title="8. Disclaimers">
          {`MathMentor AI is provided "as is" without warranties of any kind, either express or implied. We do not warrant that:\n\n• The service will be uninterrupted or error-free\n• The results obtained from use of the service will be accurate\n• Any errors in the service will be corrected\n\nWe are not responsible for any academic results, grades, or outcomes that may or may not result from using our service.`}
        </Section>

        <Section title="9. Limitation of Liability">
          {`To the fullest extent permitted by law, MathMentor AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service, even if we have been advised of the possibility of such damages.`}
        </Section>

        <Section title="10. Changes to Terms">
          {`We reserve the right to modify these Terms at any time. We will notify users of significant changes through the app. Your continued use of MathMentor AI after changes are posted constitutes your acceptance of the updated Terms.`}
        </Section>

        <Section title="11. Contact">
          {`If you have any questions about these Terms of Service, please contact us at:\n\nsupport@mathmentor.ai\n\nWe aim to respond to all inquiries within 48 hours.`}
        </Section>

        <Text style={styles.footer}>© 2025 MathMentor AI · All rights reserved</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e3e5',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#091426' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(75,65,225,0.1)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26, fontWeight: '700', color: '#091426',
    textAlign: 'center', marginBottom: 6,
  },
  effectiveDate: {
    fontSize: 12, color: '#75777d', textAlign: 'center', marginBottom: 32,
  },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#091426', marginBottom: 10 },
  sectionBody: { fontSize: 14, color: '#45474c', lineHeight: 24 },
  footer: { fontSize: 12, color: '#75777d', textAlign: 'center', marginTop: 16 },
});
