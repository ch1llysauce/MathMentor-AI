import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoDocumentTextOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

export default function Terms() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('terms'); // 'terms' | 'privacy'

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile/about')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] text-[#091426] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] dark:text-white tracking-tight">Legal & Policies</h1>
          <p className="text-xs text-[#75777d]">Terms of Service & Privacy Policy for MathMentor AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#f2f4f6] dark:bg-[#252f40] p-1 rounded-2xl mb-6">
        <button
          onClick={() => setTab('terms')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            tab === 'terms'
              ? 'bg-white dark:bg-[#1a2333] text-[#091426] dark:text-white shadow-xs'
              : 'text-[#75777d] hover:text-[#091426] dark:hover:text-white'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            tab === 'privacy'
              ? 'bg-white dark:bg-[#1a2333] text-[#091426] dark:text-white shadow-xs'
              : 'text-[#75777d] hover:text-[#091426] dark:hover:text-white'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#1a2333] rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] dark:border-[#2d3748] shadow-sm">
        {tab === 'terms' ? (
          <div className="space-y-6 text-sm text-[#45474c] dark:text-[#a0aec0] leading-relaxed">
            <div className="flex items-center gap-3 border-b border-[#f2f4f6] dark:border-[#2d3748] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center shrink-0">
                <IoDocumentTextOutline size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#091426] dark:text-white">Terms of Service</h2>
                <p className="text-xs text-[#75777d]">Effective: August 2026 · MathMentor AI</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">1. Acceptance of Terms</h3>
              <p>
                By accessing or using MathMentor AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
              </p>
              <p>
                These terms apply to all users of the app, including students, educators, and any other individuals who access our services.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">2. Description of Service</h3>
              <p>
                MathMentor AI is a personalized mathematics learning platform designed for senior high school students. The service includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Adaptive diagnostic assessments</li>
                <li>Personalized learning paths</li>
                <li>AI-powered tutoring and step-by-step explanations</li>
                <li>Practice problems and progress tracking</li>
                <li>Topic-based lessons in Algebra, Geometry, and Trigonometry</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">3. User Accounts</h3>
              <p>
                To use MathMentor AI, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Providing accurate and complete registration information</li>
                <li>Maintaining the security of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="pt-1">
                You must be at least 13 years old to create an account. Users under 18 should have parental or guardian consent.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">4. Acceptable Use</h3>
              <p>You agree not to use MathMentor AI to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
                <li>Share your account credentials with others</li>
                <li>Submit false or misleading information</li>
                <li>Interfere with or disrupt the service's functionality</li>
                <li>Reverse engineer or attempt to extract the source code</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">5. Intellectual Property</h3>
              <p>
                All content within MathMentor AI — including lessons, questions, explanations, graphics, and software — is the intellectual property of MathMentor AI and is protected by copyright law.
              </p>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to use the service for personal educational purposes only. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">6. AI-Generated Content</h3>
              <p>
                MathMentor AI uses a multi-provider AI system to generate tutoring responses, explanations, and hints. The primary provider is Groq (Meta's Llama model), with Google Gemini as a fallback, and a rule-based system as a final backup when both are unavailable.
              </p>
              <p>
                While we strive for accuracy, AI-generated content may occasionally contain mathematical errors or imprecise explanations. We do not guarantee the accuracy, completeness, or suitability of AI-generated content for any particular purpose. Always verify important mathematical concepts with your teacher or textbook.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">7. Privacy</h3>
              <p>
                Your use of MathMentor AI is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">8. Disclaimers</h3>
              <p>
                MathMentor AI is provided "as is" without warranties of any kind, either express or implied. We do not warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The service will be uninterrupted or error-free</li>
                <li>The results obtained from use of the service will be accurate</li>
                <li>Any errors in the service will be corrected</li>
              </ul>
              <p className="pt-1">
                We are not responsible for any academic results, grades, or outcomes that may or may not result from using our service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">9. Limitation of Liability</h3>
              <p>
                To the fullest extent permitted by law, MathMentor AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">10. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes through the app. Your continued use of MathMentor AI after changes are posted constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">11. Contact</h3>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="font-semibold text-[#4b41e1]">
                <a href="mailto:support@mathmentor.ai" className="hover:underline">support@mathmentor.ai</a>
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-[#45474c] dark:text-[#a0aec0] leading-relaxed">
            <div className="flex items-center gap-3 border-b border-[#f2f4f6] dark:border-[#2d3748] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,164,114,0.1)] text-[#00a472] flex items-center justify-center shrink-0">
                <IoShieldCheckmarkOutline size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#091426] dark:text-white">Privacy Policy</h2>
                <p className="text-xs text-[#75777d]">Effective: August 2026 · MathMentor AI</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">1. Introduction</h3>
              <p>
                MathMentor AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information about you when you use our application.
              </p>
              <p>
                By using MathMentor AI, you agree to the collection and use of information as described in this policy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">2. Information We Collect</h3>
              <p>We collect the following categories of information:</p>

              <div className="space-y-2 pt-1">
                <p className="font-semibold text-[#091426] dark:text-white">Account Information</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your name (display name)</li>
                  <li>Email address</li>
                  <li>Password (stored as a secure hash — never in plain text)</li>
                  <li>Grade level and focus areas</li>
                </ul>

                <p className="font-semibold text-[#091426] dark:text-white pt-2">Learning Data</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Quiz and practice question answers</li>
                  <li>Mastery levels per topic and subtopic</li>
                  <li>Diagnostic assessment results and scores</li>
                  <li>Learning path progress and lesson completions</li>
                </ul>

                <p className="font-semibold text-[#091426] dark:text-white pt-2">Usage Data</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Session activity timestamps</li>
                  <li>Study time and streak data</li>
                  <li>Login history and device information (for security)</li>
                  <li>IP address (used for session management only)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">3. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and manage your account</li>
                <li>Personalize your learning path and topic recommendations</li>
                <li>Track your academic progress over time</li>
                <li>Power the AI tutor to provide relevant explanations</li>
                <li>Identify weak areas and suggest focused practice</li>
                <li>Improve the accuracy and quality of the service</li>
                <li>Send password reset codes and security alerts</li>
                <li>Detect and prevent fraudulent or unauthorized access</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">4. Data Storage and Security</h3>
              <p>
                Your data is stored on secure servers provided by MongoDB Atlas (cloud database) and hosted through Render (backend infrastructure).
              </p>
              <p>Security measures we apply:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Passwords are hashed using bcrypt (one-way encryption)</li>
                <li>All API communication uses HTTPS/TLS encryption</li>
                <li>Two-factor authentication secrets are encrypted at rest</li>
                <li>Login sessions use JWT tokens with expiry limits</li>
                <li>Session management allows you to revoke access from any device</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">5. Data Sharing</h3>
              <p>We do not sell your personal information to third parties.</p>
              <p>We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service providers who help us operate the platform (e.g., cloud hosting, AI inference services) — under strict confidentiality obligations</li>
                <li>Law enforcement or regulatory bodies if required by applicable law</li>
              </ul>
              <p className="pt-1">
                <strong className="text-[#091426] dark:text-white">AI Tutoring:</strong> MathMentor AI uses a multi-provider AI system. Your tutoring questions are processed by Groq (primary, using Meta's Llama model) with Google Gemini as a fallback. If both are unavailable, responses are generated by our own rule-based system. We do not send your name, email, or account details to AI providers — only the mathematical question content.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">6. Your Rights</h3>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access</strong> — You can download a copy of your data at any time from Privacy & Security settings</li>
                <li><strong>Correction</strong> — You can update your profile information in Edit Profile</li>
                <li><strong>Deletion</strong> — You can permanently delete your account and all associated data from Privacy & Security settings</li>
                <li><strong>Portability</strong> — Your exported data is provided in a human-readable format</li>
              </ul>
              <p className="pt-1">
                To exercise any of these rights, use the in-app options or contact us at <a href="mailto:support@mathmentor.ai" className="text-[#4b41e1] font-semibold hover:underline">support@mathmentor.ai</a>.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">7. Data Retention</h3>
              <p>
                We retain your data for as long as your account is active. If you delete your account, all personal data — including your profile, progress, and diagnostic results — is permanently deleted from our systems within 30 days.
              </p>
              <p>
                Anonymized, aggregated data (with no connection to your identity) may be retained for improving the service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">8. Children's Privacy</h3>
              <p>
                MathMentor AI is designed for senior high school students. We do not knowingly collect personal information from children under 13 years of age.
              </p>
              <p>
                If you are a parent or guardian and believe your child under 13 has created an account, please contact us at <a href="mailto:support@mathmentor.ai" className="text-[#4b41e1] font-semibold hover:underline">support@mathmentor.ai</a> and we will delete the account promptly.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">9. Storage and Cookies</h3>
              <p>
                MathMentor AI uses local storage on your device to maintain your login session and theme preferences securely. This data is stored on your device and is cleared when you log out.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">10. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. The "Effective" date at the top of this page indicates when the policy was last updated.
              </p>
              <p>
                Your continued use of MathMentor AI after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426] dark:text-white">11. Contact Us</h3>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <p className="font-semibold text-[#4b41e1]">
                <a href="mailto:support@mathmentor.ai" className="hover:underline">Email: support@mathmentor.ai</a>
              </p>
              <p className="text-xs text-[#75777d]">We aim to respond to all privacy-related inquiries within 48 hours.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
