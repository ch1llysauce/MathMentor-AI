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
  IoWarningOutline,
} from 'react-icons/io5';
import { learningApi } from '../../services/api';
import MathText from '../../components/MathText';

export default function LessonScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { topicName, mastery, lessonTitle: initTitle } = location.state ?? {};

  const [lesson, setLesson]         = useState(null);
  const [lessonList, setLessonList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(lessonId);
  const [showQuitModal, setShowQuitModal]   = useState(false);
  const startTimeRef = useRef(Date.now());

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

  useEffect(() => { fetchLesson(activeLessonId); }, [activeLessonId]);

  const isCompleted = lesson?.userProgress?.status === 'completed';

  const handleBackClick = () => {
    if (!isCompleted) {
      setShowQuitModal(true);
    } else {
      navigate(`/practice/topic/${encodeURIComponent(lesson.topic)}`, { state: { mastery } });
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
      setActiveLessonId(lessonList[index]._id);
      setCurrentIndex(index);
      startTimeRef.current = Date.now();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-gray-500">Lesson not found.</p>
        <button onClick={() => navigate('/practice')} className="text-purple-600 font-medium">← Back to Practice</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Leave Lesson Warning Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <IoWarningOutline size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Lesson?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to leave this lesson? Mark it as complete to save your progress.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors"
              >
                Keep Learning
              </button>
              <button
                onClick={() => {
                  setShowQuitModal(false);
                  navigate(`/practice/topic/${encodeURIComponent(lesson.topic)}`, { state: { mastery } });
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors shadow-md shadow-red-500/20"
              >
                Leave Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-2xs">
        <button
          onClick={handleBackClick}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0 transition-colors"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-600 font-semibold truncate uppercase tracking-wider">{lesson.topic} · {lesson.subtopic}</p>
          <p className="text-sm font-extrabold text-gray-900 truncate">{lesson.title}</p>
        </div>
        {/* Lesson chat button */}
        <button
          onClick={() => navigate(`/practice/lesson-chat/${lesson._id}`, {
            state: { lessonTitle: lesson.title, topic: lesson.topic, subtopic: lesson.subtopic }
          })}
          className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors shrink-0"
          title="Ask AI Tutor about this lesson"
        >
          <IoChatbubbleEllipsesOutline size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-40">
        {/* Info badges */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl">
              <IoTrendingUpOutline size={14} /> {lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl">
              <IoTimeOutline size={14} /> {lesson.estimatedTime} min
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                <IoCheckmarkCircle size={14} /> Completed
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">{lesson.description}</p>
        </div>

        {/* Introduction */}
        <Section title="Introduction">
          <div className="text-base text-gray-800 leading-relaxed font-normal"><MathText text={lesson.content?.introduction} /></div>
        </Section>

        {/* Sections */}
        {lesson.content?.sections?.map((section, i) => (
          <Section key={i} title={section.title}>
            <div className="text-base text-gray-800 leading-relaxed mb-4 font-normal"><MathText text={section.content} /></div>
            {section.examples?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Examples:</p>
                {section.examples.map((ex, j) => (
                  <div key={j} className="bg-amber-50/60 border-l-4 border-amber-400 rounded-2xl p-5 mb-4 shadow-2xs">
                    <div className="flex items-center gap-2 mb-2">
                      <IoBulbOutline size={18} className="text-amber-500" />
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Example {j + 1}</span>
                    </div>
                    <div className="text-base font-bold text-amber-900 mb-3"><MathText text={ex.problem} /></div>
                    {ex.steps?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">Solution Steps:</p>
                        <div className="space-y-2">
                          {ex.steps.map((step, k) => (
                            <div key={k} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-amber-400 flex items-center justify-center text-white text-xs font-extrabold shrink-0 mt-0.5">
                                {k + 1}
                              </span>
                              <div className="text-sm text-amber-900 leading-relaxed font-medium"><MathText text={step} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-amber-200/80">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Answer:</span>
                      <span className="text-base font-extrabold text-amber-950"><MathText text={ex.solution} /></span>
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
            <div className="text-base text-gray-800 leading-relaxed font-normal"><MathText text={lesson.content.summary} /></div>
          </Section>
        )}

        {/* Key Takeaways */}
        {lesson.content?.keyTakeaways?.length > 0 && (
          <Section title="Key Takeaways">
            <div className="space-y-3">
              {lesson.content.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
                  <IoCheckmarkCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-800 leading-relaxed font-medium"><MathText text={t} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-lg z-20">
        <div className="max-w-3xl mx-auto">
          {/* Mark complete button */}
          <button
            onClick={handleToggleComplete}
            disabled={completing}
            className={`w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-2xl mb-3 transition-all disabled:opacity-60 shadow-md ${
              isCompleted
                ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-gray-600/20'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
            }`}
          >
            {completing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isCompleted ? (
              <><IoCloseCircleOutline size={20} /> Mark as Incomplete</>
            ) : (
              <><IoCheckmarkCircleOutline size={20} /> Mark as Complete</>
            )}
          </button>

          {/* Prev / Next nav */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0 || lessonList.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-purple-700"
            >
              <IoArrowBackOutline size={16} /> Previous
            </button>
            <span className="text-xs font-bold text-gray-400">
              {lessonList.length > 0 ? `${currentIndex + 1} / ${lessonList.length}` : '—'}
            </span>
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex >= lessonList.length - 1 || lessonList.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-purple-700"
            >
              Next <IoArrowForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-7">
      <h2 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h2>
      {children}
    </div>
  );
}
