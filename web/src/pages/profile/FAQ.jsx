import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoMailOutline,
} from 'react-icons/io5';

const FAQS_DATA = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is MathMentor AI?',
        a: 'MathMentor AI is a personalised math tutoring platform that uses AI to adapt to your skill level. It covers Algebra, Geometry, and Trigonometry for high school students.',
      },
      {
        q: 'How do I get started?',
        a: 'After creating your account, take the Diagnostic Test from the sidebar. It assesses your current level across all topics and builds a personalised learning path for you.',
      },
      {
        q: 'Is MathMentor AI free to use?',
        a: 'Yes — MathMentor AI is completely free for all registered users.',
      },
    ],
  },
  {
    category: 'Diagnostic Test',
    items: [
      {
        q: 'What is the Diagnostic Test?',
        a: "It's a targeted assessment evaluating your baseline proficiency in Algebra, Geometry, and Trigonometry to calibrate your topic mastery level.",
      },
      {
        q: 'How long does the Diagnostic Test take?',
        a: 'Typically 10–15 minutes. It contains curated questions covering varying difficulty levels.',
      },
      {
        q: 'Can I retake the Diagnostic Test?',
        a: 'Yes. Go to the Diagnosis tab and select "Retake Diagnostic". Your mastery baseline will update based on your new test score.',
      },
    ],
  },
  {
    category: 'Learning & Practice',
    items: [
      {
        q: 'What topics does MathMentor AI cover?',
        a: 'Algebra (linear equations, quadratics, functions), Geometry (shapes, angles, area/volume), and Trigonometry (ratios, identities, triangles).',
      },
      {
        q: 'How does the AI tutor work?',
        a: 'The Tutor AI answers your math questions, breaks down solution steps using KaTeX formatted math expressions, and provides tailored hints.',
      },
      {
        q: 'What does mastery level mean?',
        a: 'Each topic features a 0–100% mastery percentage derived from diagnostic results and practice problem performance.',
      },
    ],
  },
  {
    category: 'Account & Data',
    items: [
      {
        q: 'How do I change my profile name?',
        a: 'Go to Profile → Account → Edit Profile to update your display name.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Go to Profile → Privacy & Security → Download My Data to export a summary of your profile and diagnostic records.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Profile → Privacy & Security → Delete My Data, or contact support@mathmentor.ai. Account deletion is permanent.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'What browser is recommended?',
        a: 'MathMentor AI works best on modern desktop and mobile browsers like Chrome, Edge, Safari, and Firefox.',
      },
      {
        q: 'The app seems slow — what can I do?',
        a: 'Try refreshing the page, or clearing your app cache via Settings → Storage Usage → Clear Cache.',
      },
    ],
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (key) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Frequently Asked Questions</h1>
      </div>

      <p className="text-sm text-[#75777d] mb-6">
        Find answers to common questions about MathMentor AI, learning paths, and account settings.
      </p>

      {/* FAQ Sections */}
      <div className="space-y-6 mb-8">
        {FAQS_DATA.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-bold text-[#4b41e1] uppercase tracking-wider mb-2 ml-1">
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden divide-y divide-[#f2f4f6]">
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f7f9fb] transition-colors"
                    >
                      <span className="text-sm font-semibold text-[#091426] pr-4">{item.q}</span>
                      {isOpen ? (
                        <IoChevronUpOutline className="text-[#75777d] shrink-0" size={18} />
                      ) : (
                        <IoChevronDownOutline className="text-[#75777d] shrink-0" size={18} />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 bg-[#f7f9fb] text-sm text-[#45474c] leading-relaxed whitespace-pre-line border-t border-[#f2f4f6]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center shrink-0">
          <IoMailOutline size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#091426]">Still need help?</h3>
          <p className="text-xs text-[#75777d] mt-1 leading-relaxed">
            Email us at{' '}
            <a href="mailto:support@mathmentor.ai" className="text-[#4b41e1] font-semibold hover:underline">
              support@mathmentor.ai
            </a>
            {' '}and our team will respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
