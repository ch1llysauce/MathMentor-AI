import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrendingUpOutline,
  IoTimeOutline,
  IoBulbOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { learningApi } from '../../services/api';
import MathText from '../../components/MathText';
import { useTheme } from '../../context/ThemeContext';

const TOPIC_COLORS = {
  Algebra: '#2563eb',
  Geometry: '#8b5cf6',
  Trigonometry: '#f59e0b',
};

export default function LessonScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor, darkMode } = useTheme();
  const activePrimary = primaryColor || '#7c3aed';
  const { topicName, mastery, lessonTitle: initTitle } = location.state ?? {};

  const [lesson, setLesson]         = useState(null);
  const [lessonList, setLessonList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(lessonId);
  const startTimeRef = useRef(Date.now());

  const topicColor = TOPIC_COLORS[lesson?.topic] || activePrimary;
  const baseBg = darkMode ? '#0b0f17' : '#f8fafc';

  const fetchLesson = async (id) => {
    setLoading(true);
    try {
      const { data } = await learningApi.getLesson(id);
      const l = data?.data?.lesson ?? data?.lesson;
      const progress = data?.data?.progress ?? data?.progress;
      setLesson({ ...l, userProgress: progress ?? l?.userProgress });
      // Fetch sibling lessons for prev/next
      const listRes = await learningApi.getLessons({ topic: l.topic });
      const list = listRes.data?.data?.lessons ?? listRes.data?.lessons ?? [];
      setLessonList(list);
      const idx = list.findIndex((x) => x._id === id);
      if (idx >= 0) setCurrentIndex(idx);
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId);
    }
  }, [lessonId]);

  const isCompleted = lesson?.userProgress?.status === 'completed';

  const handleBackClick = () => {
    if (lesson?.topic) {
      navigate(`/practice/topic/${encodeURIComponent(lesson.topic)}`, { state: { mastery } });
    } else {
      navigate('/practice');
    }
  };

  const handleToggleComplete = async () => {
    if (!lesson) return;
    setCompleting(true);
    try {
      if (isCompleted) {
        await learningApi.markIncomplete(lesson._id);
        setLesson((l) => ({ ...l, userProgress: { ...l.userProgress, status: 'in-progress' } }));
      } else {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        await learningApi.completeLesson(lesson._id, timeSpent);
        setLesson((l) => ({ ...l, userProgress: { ...l.userProgress, status: 'completed', completedAt: new Date().toISOString() } }));
      }
    } catch { /* ignore */ }
    finally { setCompleting(false); }
  };

  const goTo = (index) => {
    if (lessonList[index]) {
      const nextId = lessonList[index]._id;
      setCurrentIndex(index);
      startTimeRef.current = Date.now();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate(`/practice/lesson/${nextId}`, { replace: true, state: { topicName, mastery } });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: activePrimary, borderTopColor: 'transparent' }} />
        <p className="text-sm text-gray-400">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-gray-500">Lesson not found.</p>
        <button onClick={() => navigate('/practice')} style={{ color: activePrimary }} className="font-medium">← Back to Practice</button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-full transition-colors duration-300"
      style={{
        background: `linear-gradient(180deg, ${topicColor}${darkMode ? '1F' : '0E'} 0%, ${baseBg} 500px)`
      }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-[#1a2333] border-b border-gray-100 dark:border-[#2d3748] px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-2xs">
        <button
          onClick={handleBackClick}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#252f40] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d3748] shrink-0 transition-colors cursor-pointer"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p style={{ color: activePrimary }} className="text-xs font-semibold truncate uppercase tracking-wider">{lesson.topic} · {lesson.subtopic}</p>
          <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{lesson.title}</p>
        </div>
        {/* Lesson chat button */}
        <button
          onClick={() => navigate(`/practice/lesson-chat/${lesson._id}`, {
            state: { lessonTitle: lesson.title, topic: lesson.topic, subtopic: lesson.subtopic }
          })}
          style={{
            backgroundColor: `${activePrimary}18`,
            color: activePrimary
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          title="Ask AI Tutor about this lesson"
        >
          <IoChatbubbleEllipsesOutline size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-48 sm:pb-52">
        {/* Info badges */}
        <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-3xl p-5 shadow-2xs mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span style={{ backgroundColor: `${activePrimary}15`, borderColor: `${activePrimary}30`, color: activePrimary }} className="inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-xl">
              <IoTrendingUpOutline size={14} /> {lesson.difficulty}
            </span>
            <span style={{ backgroundColor: `${activePrimary}15`, borderColor: `${activePrimary}30`, color: activePrimary }} className="inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-xl">
              <IoTimeOutline size={14} /> {lesson.estimatedTime} min
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl">
                <IoCheckmarkCircle size={14} /> Completed
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{lesson.description}</p>
        </div>

        {/* Introduction */}
        <Section title="Introduction">
          <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal"><MathText text={lesson.content?.introduction} /></div>
        </Section>

        {/* Sections */}
        {lesson.content?.sections?.map((section, i) => (
          <Section key={i} title={section.title}>
            <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-normal"><MathText text={section.content} /></div>
            {section.examples?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Examples:</p>
                {section.examples.map((ex, j) => (
                  <div key={j} className="bg-amber-50/60 dark:bg-amber-950/30 border-l-4 border-amber-400 dark:border-amber-500 rounded-2xl p-5 mb-4 shadow-2xs">
                    <div className="flex items-center gap-2 mb-2">
                      <IoBulbOutline size={18} className="text-amber-500 dark:text-amber-400" />
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Example {j + 1}</span>
                    </div>
                    <div className="text-base font-bold text-amber-900 dark:text-amber-100 mb-3"><MathText text={ex.problem} /></div>
                    {ex.steps?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 uppercase tracking-wide">Solution Steps:</p>
                        <div className="space-y-2">
                          {ex.steps.map((step, k) => (
                            <div key={k} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-amber-400 dark:bg-amber-500 flex items-center justify-center text-white text-xs font-extrabold shrink-0 mt-0.5">
                                {k + 1}
                              </span>
                              <div className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed font-medium"><MathText text={step} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-amber-200/80 dark:border-amber-800/60">
                      <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Answer:</span>
                      <span className="text-base font-extrabold text-amber-950 dark:text-amber-100"><MathText text={ex.solution} /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        ))}

        {/* Summary */}
        {lesson.content?.summary && (
          <Section title="Summary">
            <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal"><MathText text={lesson.content.summary} /></div>
          </Section>
        )}

        {/* Key Takeaways */}
        {lesson.content?.keyTakeaways?.length > 0 && (
          <Section title="Key Takeaways">
            <div className="space-y-3">
              {lesson.content.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-2xl">
                  <IoCheckmarkCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium"><MathText text={t} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 dark:bg-[#1a2333]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#2d3748] px-4 py-3 pb-6 sm:pb-3 shadow-2xl z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Prev Button */}
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0 || lessonList.length === 0}
            style={{ color: (currentIndex === 0 || lessonList.length === 0) ? undefined : activePrimary }}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-[#252f40] hover:bg-opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-gray-200 dark:border-[#374151]"
          >
            <IoArrowBackOutline size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Center: Mark Complete / Incomplete Button & Page Counter */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={handleToggleComplete}
              disabled={completing}
              style={{
                backgroundColor: isCompleted ? (darkMode ? '#374151' : '#64748b') : activePrimary,
                borderColor: isCompleted ? (darkMode ? '#4b5563' : '#9ca3af') : 'transparent',
                color: '#ffffff'
              }}
              className="w-full max-w-xs flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-2.5 px-3 sm:px-4 rounded-xl transition-all disabled:opacity-60 shadow-md cursor-pointer border hover:opacity-90 active:scale-[0.98]"
            >
              {completing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isCompleted ? (
                <><IoCloseCircleOutline size={18} className="text-red-300" /> Mark as Incomplete</>
              ) : (
                <><IoCheckmarkCircleOutline size={18} className="text-white" /> Mark as Complete</>
              )}
            </button>

            <span className="text-xs font-bold text-gray-500 dark:text-gray-300 whitespace-nowrap px-1">
              {lessonList.length > 0 ? `${currentIndex + 1} / ${lessonList.length}` : '—'}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= lessonList.length - 1 || lessonList.length === 0}
            style={{ color: (currentIndex >= lessonList.length - 1 || lessonList.length === 0) ? undefined : activePrimary }}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-[#252f40] hover:bg-opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-gray-200 dark:border-[#374151]"
          >
            <span className="hidden sm:inline">Next</span>
            <IoArrowForwardOutline size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-7">
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h2>
      {children}
    </div>
  );
}
