import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoSearchOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoMailOutline,
  IoMegaphoneOutline,
  IoArrowForwardOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  const faqs = [
    {
      question: 'How do I start a diagnostic test?',
      answer: 'Go to the Diagnosis section in the sidebar menu and click on "Start Assessment". You can choose your target difficulty level before starting.',
    },
    {
      question: 'What are mastery levels?',
      answer: 'Mastery levels represent your understanding of a topic based on your answers:\n• 0–50%: Learning\n• 50–80%: Proficient\n• 80–100%: Expert',
    },
    {
      question: 'How does the learning streak work?',
      answer: 'Your streak increases for each consecutive day you complete at least one practice problem or lesson.',
    },
    {
      question: 'Can I change my difficulty level?',
      answer: 'Yes! Go to Diagnosis or Settings to adjust your learning difficulty at any time.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Your Dashboard provides a high-level overview of overall progress, while Practice and Diagnosis show domain-specific mastery breakdowns.',
    },
    {
      question: 'Are math equations rendered formatted?',
      answer: 'Yes, MathMentor AI uses KaTeX to render clean LaTeX formulas across all questions, hints, and explanations.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setToast('Thank you for your feedback! We appreciate your input.');
      setTimeout(() => setToast(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#091426] text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <IoCheckmarkCircleOutline className="text-[#00a472] text-xl" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Help Center</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d] text-xl" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for help..."
          className="w-full bg-white border border-[#e0e3e5] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#091426] placeholder-[#75777d] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition"
        />
      </div>

      {/* FAQs Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#091426] mb-3">
          Frequently Asked Questions
          {searchQuery && <span className="text-xs font-normal text-[#75777d] ml-2">({filteredFaqs.length} results)</span>}
        </h2>

        {filteredFaqs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden divide-y divide-[#f2f4f6]">
            {filteredFaqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div key={index}>
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f7f9fb] transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#091426] pr-4">{faq.question}</span>
                    {isOpen ? (
                      <IoChevronUpOutline className="text-[#75777d] shrink-0" size={18} />
                    ) : (
                      <IoChevronDownOutline className="text-[#75777d] shrink-0" size={18} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 bg-[#f7f9fb] text-sm text-[#45474c] leading-relaxed whitespace-pre-line border-t border-[#f2f4f6]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-8 text-center shadow-xs">
            <IoSearchOutline className="mx-auto text-4xl text-[#c5c6cd] mb-3" />
            <p className="text-base font-semibold text-[#091426]">No results found</p>
            <p className="text-xs text-[#75777d] mt-1">
              Try searching with different keywords or contact support below.
            </p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#091426] mb-3">Contact Support</h2>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden">
          <a
            href="mailto:support@mathmentor.ai?subject=Support Request"
            className="flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center">
                <IoMailOutline size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#091426]">Email Support</p>
                <p className="text-xs text-[#75777d]">support@mathmentor.ai</p>
              </div>
            </div>
            <IoChevronForwardOutline className="text-[#75777d]" size={18} />
          </a>
        </div>
      </div>

      {/* Feedback Banner */}
      <div className="bg-gradient-to-br from-[#e2dfff] to-[#eeeaff] rounded-3xl p-6 shadow-sm border border-[#c5bfff]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white text-[#4b41e1] flex items-center justify-center shadow-xs">
            <IoMegaphoneOutline size={22} />
          </div>
          <h3 className="text-lg font-bold text-[#091426]">Send Feedback</h3>
        </div>
        <p className="text-sm text-[#45474c] mb-4">
          Have suggestions or found a bug? We'd love to hear from you to make MathMentor AI better.
        </p>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="w-full bg-[#4b41e1] hover:bg-[#3323cc] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>Share Your Thoughts</span>
          <IoArrowForwardOutline size={18} />
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#091426] mb-2">Share Your Feedback</h3>
            <p className="text-xs text-[#75777d] mb-4">
              Your feedback directly influences new features and improvements.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you like? What can we improve?"
                className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl p-3 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={feedbackSubmitted}
                  className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] disabled:opacity-60 transition-colors"
                >
                  {feedbackSubmitted ? 'Sending…' : 'Submit Feedback'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
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
