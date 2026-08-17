import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoDocumentTextOutline } from 'react-icons/io5';

export default function Terms() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('terms'); // 'terms' | 'privacy'

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile/about')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Legal & Policies</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#f2f4f6] p-1 rounded-2xl mb-6">
        <button
          onClick={() => setTab('terms')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            tab === 'terms' ? 'bg-white text-[#091426] shadow-xs' : 'text-[#75777d] hover:text-[#091426]'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            tab === 'privacy' ? 'bg-white text-[#091426] shadow-xs' : 'text-[#75777d] hover:text-[#091426]'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs">
        {tab === 'terms' ? (
          <div className="space-y-6 text-sm text-[#45474c] leading-relaxed">
            <div className="flex items-center gap-3 border-b border-[#f2f4f6] pb-4">
              <IoDocumentTextOutline className="text-[#4b41e1] text-2xl" />
              <div>
                <h2 className="text-lg font-bold text-[#091426]">Terms of Service</h2>
                <p className="text-xs text-[#75777d]">Effective Date: August 2026</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">1. Acceptance of Terms</h3>
              <p>
                By accessing and using MathMentor AI, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue use of the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">2. User Accounts & Responsibilities</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate registration details.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">3. Educational Content & Intellectual Property</h3>
              <p>
                All practice problems, diagnostic algorithms, AI Tutor prompts, and mathematical material on MathMentor AI are protected by intellectual property laws.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">4. Limitation of Liability</h3>
              <p>
                MathMentor AI is provided "as is" for supplementary educational purposes. We strive for maximum accuracy in step-by-step math solutions but make no guarantees regarding exam outcomes.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-[#45474c] leading-relaxed">
            <div className="flex items-center gap-3 border-b border-[#f2f4f6] pb-4">
              <IoDocumentTextOutline className="text-[#2196f3] text-2xl" />
              <div>
                <h2 className="text-lg font-bold text-[#091426]">Privacy Policy</h2>
                <p className="text-xs text-[#75777d]">Last Updated: August 2026</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">1. Information We Collect</h3>
              <p>
                We collect personal information such as display name, email address, grade level, topic practice history, and diagnostic performance metrics.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">2. How Information is Used</h3>
              <p>
                Your data is exclusively used to tailor learning paths, render real-time progress metrics, and fine-tune AI Tutor responses. We never sell your personal information.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-[#091426]">3. Data Security & Storage</h3>
              <p>
                Data is encrypted in transit and stored in secured cloud environments. Account passwords are salted and hashed using bcrypt.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
