import { Link } from 'react-router-dom';
import {
  IoSearchOutline, IoBookOutline, IoPencilOutline,
  IoChatbubblesOutline, IoAnalyticsOutline, IoPhonePortraitOutline,
  IoCalculatorOutline, IoArrowForwardOutline, IoDownloadOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

const features = [
  { Icon: IoSearchOutline,       title: 'Diagnostic Assessment', desc: 'An initial placement test that evaluates your knowledge across Algebra, Geometry, and Trigonometry to benchmark your starting level.' },
  { Icon: IoBookOutline,         title: 'Adaptive Learning',     desc: 'Dynamic problem difficulty (Easy, Medium, Hard) that automatically scales in real time based on your ongoing practice accuracy.' },
  { Icon: IoPencilOutline,       title: 'Practice Problems',     desc: 'Topic-based practice sets with multiple difficulty levels, immediate feedback, and AI-generated hints.' },
  { Icon: IoChatbubblesOutline,  title: 'Tutor AI',              desc: 'An AI-powered math tutor that answers questions, explains concepts, and guides you step by step.' },
  { Icon: IoAnalyticsOutline,    title: 'Progress Tracking',     desc: 'Track mastery by topic, review weak areas, and monitor your improvement over time with detailed analytics.' },
  { Icon: IoPhonePortraitOutline,title: 'Web & Mobile',          desc: 'Access MathMentor AI from your browser or download the Android app — your progress syncs across both.' },
];

const subjects = [
  { label: 'Algebra',      desc: '10 modules · 45 lessons', color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)' },
  { label: 'Geometry',     desc: '9 modules · 40 lessons',  color: '#00a472', bg: 'rgba(0,164,114,0.08)', border: 'rgba(0,164,114,0.2)' },
  { label: 'Trigonometry', desc: '9 modules · 31 lessons',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',border: 'rgba(245,158,11,0.2)' },
];

const steps = [
  { num: '1', title: 'Take the Diagnostic',  desc: 'Complete a short assessment to determine your starting level in each subject.' },
  { num: '2', title: 'Follow Your Path',     desc: 'Work through lessons and practice problems tailored to your knowledge gaps.' },
  { num: '3', title: 'Ask Tutor AI',         desc: 'Get instant explanations and hints whenever you are stuck on a problem.' },
  { num: '4', title: 'Track Progress',       desc: 'Review your mastery scores, streaks, and weak areas on your dashboard.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#0f172a]">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#1a2333]/90 backdrop-blur border-b border-[#e0e3e5] dark:border-[#2d3748]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MathMentor AI Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-[#091426] dark:text-white tracking-tight">MathMentor AI</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard"
                className="text-sm bg-[#4b41e1] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#3323cc] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                Go to Dashboard <IoArrowForwardOutline size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm text-[#45474c] dark:text-gray-300 hover:text-[#091426] font-medium px-3 py-1.5 rounded-xl hover:bg-[#f2f4f6] dark:hover:bg-[#252f40] transition-colors">
                  Sign in
                </Link>
                <Link to="/register"
                  className="text-sm bg-[#4b41e1] text-white px-4 py-1.5 rounded-xl font-semibold hover:bg-[#3323cc] transition-colors shadow-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#4b41e1] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <IoCheckmarkCircleOutline size={14} /> 116 lessons · 28 modules · AI-powered
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Learn Math with<br className="hidden sm:block" /> an AI Mentor
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            MathMentor AI is an adaptive learning platform for Algebra, Geometry, and Trigonometry.
            Get personalized assessments, practice problems, and an AI tutor — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#4b41e1] font-bold px-8 py-3.5 rounded-2xl hover:bg-[#f2f4f6] transition-colors shadow-lg text-sm cursor-pointer">
                  Go to Dashboard <IoArrowForwardOutline size={16} />
                </Link>
                <a href="/MathMentorAI.apk" download="MathMentor-AI.apk"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors text-sm cursor-pointer">
                  <IoDownloadOutline size={18} /> Download Android APK
                </a>
              </>
            ) : (
              <>
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#4b41e1] font-bold px-8 py-3.5 rounded-2xl hover:bg-[#f2f4f6] transition-colors shadow-lg text-sm">
                  Start Learning Free <IoArrowForwardOutline size={16} />
                </Link>
                <Link to="/login"
                  className="inline-flex items-center justify-center border border-white/30 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors text-sm">
                  Sign in
                </Link>
                <a href="/MathMentorAI.apk" download="MathMentor-AI.apk"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/25 transition-colors text-sm cursor-pointer backdrop-blur-xs">
                  <IoDownloadOutline size={18} /> Android APK
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#091426] dark:text-white mb-2 tracking-tight">Supported Subjects</h2>
          <p className="text-[#45474c] dark:text-gray-300 mb-10">116 lessons across 28 modules, structured for high school students.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {subjects.map(s => (
              <div key={s.label} className="rounded-3xl p-6 border-2 text-left"
                style={{ backgroundColor: s.bg, borderColor: s.border }}>
                <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.label}</p>
                <p className="text-sm" style={{ color: s.color, opacity: 0.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#091426] text-center mb-2 tracking-tight">Everything You Need to Succeed</h2>
          <p className="text-[#45474c] text-center mb-12">A complete adaptive learning system, not just a quiz app.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="p-6 bg-[#f7f9fb] rounded-3xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#e2dfff] flex items-center justify-center text-[#4b41e1] mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-[#091426] mb-2">{title}</h3>
                <p className="text-sm text-[#45474c] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-[#e2dfff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#091426] text-center mb-12 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#4b41e1] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">
                  {s.num}
                </div>
                <h3 className="font-bold text-[#091426] mb-2">{s.title}</h3>
                <p className="text-sm text-[#45474c] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#091426] dark:text-white mb-3 tracking-tight">
            {isAuthenticated ? 'Ready to continue learning?' : 'Ready to start learning?'}
          </h2>
          <p className="text-[#45474c] dark:text-gray-300 mb-8">
            {isAuthenticated
              ? 'Jump back into your dashboard and continue your practice sessions.'
              : 'Create a free account and take your first diagnostic test today.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-[#4b41e1] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#3323cc] transition-colors shadow-md text-sm cursor-pointer">
                Go to Dashboard <IoArrowForwardOutline size={16} />
              </Link>
            ) : (
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#4b41e1] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#3323cc] transition-colors shadow-md text-sm">
                Create Account <IoArrowForwardOutline size={16} />
              </Link>
            )}
            <a href="/MathMentorAI.apk" download="MathMentor-AI.apk"
              className="inline-flex items-center justify-center gap-2 border border-[#e0e3e5] dark:border-[#374151] text-[#45474c] dark:text-gray-300 font-semibold px-8 py-3.5 rounded-2xl hover:bg-[#f2f4f6] dark:hover:bg-[#252f40] transition-colors text-sm cursor-pointer">
              <IoDownloadOutline size={18} /> Download Android APK
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0e3e5] py-8 text-center text-sm text-[#75777d]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="MathMentor AI Logo" className="w-6 h-6 rounded-md object-contain" />
          <span className="font-semibold text-[#091426]">MathMentor AI</span>
        </div>
        <p>© {new Date().getFullYear()} MathMentor AI. Built for high school students.</p>
      </footer>
    </div>
  );
}
