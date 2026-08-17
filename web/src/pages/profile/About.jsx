import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoCalculatorOutline,
  IoAnalyticsOutline,
  IoMapOutline,
  IoChatbubbleEllipsesOutline,
  IoBarChartOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';

const FEATURES = [
  {
    icon: IoAnalyticsOutline,
    label: 'Diagnostic Assessment',
    desc: 'Pinpoints your strengths and gaps across Algebra, Geometry, and Trigonometry.',
  },
  {
    icon: IoMapOutline,
    label: 'Personalised Learning Path',
    desc: 'Adaptive study recommendations that evolve as your accuracy improves.',
  },
  {
    icon: IoChatbubbleEllipsesOutline,
    label: 'AI Tutor',
    desc: 'Ask anything — get step-by-step KaTeX mathematical explanations in real time.',
  },
  {
    icon: IoBarChartOutline,
    label: 'Progress Tracking',
    desc: 'Mastery levels, streaks, and accuracy metrics across every subtopic.',
  },
];

export default function About() {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-[#091426] tracking-tight">About</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-b from-[rgba(75,65,225,0.12)] to-white dark:from-[rgba(75,65,225,0.25)] dark:to-[#18181b] rounded-3xl p-8 border border-[#e0e3e5] dark:border-zinc-800 shadow-xs text-center flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#4b41e1] text-white flex items-center justify-center shadow-md mb-3">
          <IoCalculatorOutline size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#091426] dark:text-white tracking-tight">MathMentor AI</h2>
        <span className="text-xs font-semibold text-[#4b41e1] dark:text-indigo-300 bg-[rgba(75,65,225,0.1)] dark:bg-[rgba(99,102,241,0.25)] px-3 py-1 rounded-full mt-1">
          Version 1.0.0
        </span>
        <p className="text-sm text-[#45474c] dark:text-zinc-300 mt-3 max-w-md leading-relaxed">
          Your personalised AI-powered mathematics tutor designed for high school students to build genuine math mastery.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">
          What MathMentor AI Does
        </h3>
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs">
          <p className="text-sm text-[#45474c] leading-relaxed">
            MathMentor AI combines diagnostic assessments, adaptive practice problem generation, and an intelligent interactive tutor to guide students step-by-step through Algebra, Geometry, and Trigonometry at their own pace.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">
          Core Features
        </h3>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden divide-y divide-[#f2f4f6]">
          {FEATURES.map((f) => {
            const IconComponent = f.icon;
            return (
              <div key={f.label} className="p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] text-[#4b41e1] flex items-center justify-center shrink-0">
                  <IconComponent size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#091426]">{f.label}</h4>
                  <p className="text-xs text-[#75777d] mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">
          Legal
        </h3>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden divide-y divide-[#f2f4f6]">
          <button
            onClick={() => navigate('/profile/terms')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <span className="text-sm font-semibold text-[#091426]">Terms of Service & Privacy Policy</span>
            <IoChevronForwardOutline size={18} className="text-[#75777d]" />
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#75777d]">
        © {new Date().getFullYear()} MathMentor AI. All rights reserved.
      </p>
    </div>
  );
}
