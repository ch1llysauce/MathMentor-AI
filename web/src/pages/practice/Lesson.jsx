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
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(`/practice/topic/${encodeURIComponent(lesson.topic)}`, { state: { mastery } })}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{lesson.topic} · {lesson.subtopic}</p>
          <p className="text-sm font-bold text-gray-900 truncate">{lesson.title}</p>
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
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-40">
        {/* Info badges */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <IoTrendingUpOutline size={13} /> {lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <IoTimeOutline size={13} /> {lesson.estimatedTime} min
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <IoCheckmarkCircle size={13} /> Completed
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{lesson.description}</p>
        </div>

        {/* Introduction */}
        <Section title="Introduction">
          <div className="text-sm text-gray-700 leading-relaxed"><MathText text={lesson.content?.introduction} /></div>
        </Section>

        {/* Sections */}
        {lesson.content?.sections?.map((section, i) => (
          <Section key={i} title={section.title}>
            <div className="text-sm text-gray-700 leading-relaxed mb-4"><MathText text={section.content} /></div>
            {section.examples?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Examples:</p>
                {section.examples.map((ex, j) => (
                  <div key={j} className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <IoBulbOutline size={16} className="text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-800">Example {j + 1}</span>
                    </div>
                    <div className="text-sm font-semibold text-yellow-900 mb-2"><MathText text={ex.problem} /></div>
                    {ex.steps?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-yellow-800 mb-2">Solution Steps:</p>
                        {ex.steps.map((step, k) => (
                          <div key={k} className="flex items-start gap-2 mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                              {k + 1}
                            </span>
                            <div className="text-xs text-yellow-900 leading-relaxed"><MathText text={step} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-yellow-300">
                      <span className="text-xs font-semibold text-yellow-800">Answer:</span>
                      <span className="text-sm font-bold text-yellow-900"><MathText text={ex.solution} /></span>
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
            <div className="text-sm text-gray-700 leading-relaxed"><MathText text={lesson.content.summary} /></div>
          </Section>
        )}

        {/* Key Takeaways */}
        {lesson.content?.keyTakeaways?.length > 0 && (
          <Section title="Key Takeaways">
            <div className="space-y-2.5">
              {lesson.content.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <IoCheckmarkCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 leading-relaxed"><MathText text={t} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg lg:left-60">
        {/* Mark complete button */}
        <button
          onClick={handleToggleComplete}
          disabled={completing}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl mb-3 transition-colors disabled:opacity-60 ${
            isCompleted
              ? 'bg-gray-500 text-white hover:bg-gray-600'
              : 'bg-purple-600 text-white hover:bg-purple-700'
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
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0 || lessonList.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <IoArrowBackOutline size={16} /> Previous
          </button>
          <span className="text-xs font-semibold text-gray-400">
            {lessonList.length > 0 ? `${currentIndex + 1} / ${lessonList.length}` : '—'}
          </span>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= lessonList.length - 1 || lessonList.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Next <IoArrowForwardOutline size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}
