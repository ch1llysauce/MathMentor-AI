import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoSearchOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoMailOutline,
  IoMegaphoneOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

const FAQS_DATA = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is MathMentor AI?',
        a: 'MathMentor AI is a personalized math tutoring platform that uses AI to adapt to your skill level. It covers Algebra, Geometry, and Trigonometry for high school students.',
      },
      {
        q: 'How do I get started?',
        a: 'After creating your account, take the Diagnostic Test from the sidebar. It assesses your current level across all topics and builds a personalized learning path for you.',
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
        a: 'Go to Profile → Account & Security → Edit Profile to update your display name.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Go to Profile → Account & Security → Privacy & Security to download your data.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Profile → Account & Security → Edit Profile or Privacy & Security, or contact support@mathmentor.ai. Account deletion is permanent.',
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
        a: 'Try refreshing the page, or clearing your app offline cache via Settings → Data & Storage.',
      },
    ],
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  const toggle = (key) => setOpenIndex(openIndex === key ? null : key);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQS_DATA;
    const query = searchQuery.toLowerCase();
    return FAQS_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setToast('Thank you for your feedback! We appreciate your input.');
      setTimeout(() => setToast(''), 3000);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white dark:bg-[#1a2333] text-[#091426] dark:text-white text-sm px-4 py-3 rounded-xl shadow-lg border border-[#00a472] flex items-center gap-2 animate-slide-down">
          <IoCheckmarkCircleOutline className="text-[#00a472] text-xl" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] text-[#091426] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] dark:text-white tracking-tight">Help & FAQs</h1>
          <p className="text-xs text-[#75777d]">Find instant answers regarding diagnostic scoring, topic mastery & practice</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d] text-xl" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for help topics, diagnostic rules, or formulas..."
          className="w-full bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#091426] dark:text-white placeholder-[#75777d] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition"
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6 mb-8">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-bold text-[#4b41e1] uppercase tracking-wider mb-2 ml-1">
                {section.category}
              </h2>
              <div className="bg-white dark:bg-[#1a2333] rounded-2xl border border-[#e0e3e5] dark:border-[#2d3748] shadow-xs overflow-hidden divide-y divide-[#f2f4f6] dark:divide-[#252f40]">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openIndex === key || (searchQuery.trim().length > 0);
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f7f9fb] dark:hover:bg-[#252f40] transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-[#091426] dark:text-white pr-4">{item.q}</span>
                        {isOpen ? (
                          <IoChevronUpOutline className="text-[#75777d] shrink-0" size={18} />
                        ) : (
                          <IoChevronDownOutline className="text-[#75777d] shrink-0" size={18} />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 bg-[#f7f9fb] dark:bg-[#252f40]/50 text-sm text-[#45474c] dark:text-[#a0aec0] leading-relaxed whitespace-pre-line border-t border-[#f2f4f6] dark:border-[#2d3748]">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#1a2333] rounded-2xl border border-[#e0e3e5] dark:border-[#2d3748] p-8 text-center shadow-xs">
            <IoSearchOutline className="mx-auto text-4xl text-[#75777d] mb-3" />
            <p className="text-base font-semibold text-[#091426] dark:text-white">No matching results</p>
            <p className="text-xs text-[#75777d] mt-1">
              Try searching with different keywords or contact support below.
            </p>
          </div>
        )}
      </div>

      {/* Grid for Support & Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Support Card */}
        <div className="bg-white dark:bg-[#1a2333] rounded-2xl p-5 border border-[#e0e3e5] dark:border-[#2d3748] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center shrink-0">
            <IoMailOutline size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#091426] dark:text-white">Still need help?</h3>
            <p className="text-xs text-[#75777d] mt-1 leading-relaxed">
              Email us directly at{' '}
              <a href="mailto:support@mathmentor.ai" className="text-[#4b41e1] font-semibold hover:underline">
                support@mathmentor.ai
              </a>
              {' '}and our team will respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="bg-white dark:bg-[#1a2333] rounded-2xl p-5 border border-[#e0e3e5] dark:border-[#2d3748] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] text-[#ff9800] flex items-center justify-center shrink-0">
            <IoMegaphoneOutline size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#091426] dark:text-white">Have Feedback?</h3>
            <p className="text-xs text-[#75777d] mt-1 leading-relaxed mb-3">
              Help us improve MathMentor AI by sharing feature ideas or reporting issues.
            </p>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="bg-[#4b41e1] hover:bg-[#3323cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Share Feedback</span>
              <IoArrowForwardOutline size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#091426] dark:text-white mb-2">Share Your Feedback</h3>
            <p className="text-xs text-[#75777d] mb-4">
              Your feedback directly influences new features and app updates.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you like? What can we improve?"
                className="w-full bg-[#f2f4f6] dark:bg-[#252f40] border border-[#e0e3e5] dark:border-[#2d3748] rounded-xl p-3 text-sm text-[#091426] dark:text-white placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={feedbackSubmitted}
                  className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {feedbackSubmitted ? 'Sending…' : 'Submit Feedback'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 bg-[#f2f4f6] dark:bg-[#252f40] text-[#45474c] dark:text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
