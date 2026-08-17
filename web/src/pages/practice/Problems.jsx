import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBulbOutline,
  IoHelpCircleOutline,
  IoTrophyOutline,
  IoCalculatorOutline,
  IoSparklesOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { generateProblems } from '../../services/clientProblemGenerator';
import { practiceApi } from '../../services/api';
import MathToolbar from '../../components/MathToolbar';
import ScientificCalculator from '../../components/ScientificCalculator';
import MathText from '../../components/MathText';

const diffColor = (d) =>
  d === 'Easy' ? { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', hex: '#00a472' } :
  d === 'Hard' ? { bg: 'bg-red-50 border-red-200',     text: 'text-red-600',     hex: '#ef4444' } :
                 { bg: 'bg-yellow-50 border-yellow-200',  text: 'text-yellow-700',  hex: '#f59e0b' };

export default function Problems() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { topic, category, count, title, difficulty, isDaily } = location.state ?? {};

  const [problems, setProblems]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [selectedAnswer, setSelected]     = useState(null);
  const [showExplanation, setShowExp]     = useState(false);
  const [isCorrect, setIsCorrect]         = useState(null);
  const [showHint, setShowHint]           = useState(false);
  const [showResults, setShowResults]     = useState(false);
  const [showCalc, setShowCalc]           = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const correctCountRef = useRef(0);
  const [correctCount, setCorrectCount]   = useState(0);
  const answerRef = useRef(null);

  useEffect(() => {
    const list = generateProblems(topic ?? 'algebra', category ?? 'mixed', count ?? 10);
    setProblems(list);
    setLoading(false);
  }, []);

  // Prevent accidental navigation / tab closure while session is active
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!showResults) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults]);

  const handleBackClick = () => {
    if (!showResults) {
      setShowQuitModal(true);
    } else {
      navigate(-1);
    }
  };

  const current = problems[currentIndex];
  const opts    = current?.options || current?.choices || [];
  const isFree  = current?.type === 'free-response' || opts.length === 0;
  const diff    = diffColor(current?.difficulty ?? difficulty ?? 'Medium');

  // Insert a symbol at cursor position (or append if no cursor)
  const handleInsert = (symbol) => {
    const el = answerRef.current;
    if (el) {
      const start = el.selectionStart ?? el.value.length;
      const end   = el.selectionEnd   ?? el.value.length;
      const prev  = selectedAnswer ?? '';
      const next  = prev.slice(0, start) + symbol + prev.slice(end);
      setSelected(next);
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        el.selectionStart = start + symbol.length;
        el.selectionEnd   = start + symbol.length;
        el.focus();
      });
    } else {
      setSelected((prev) => (prev ?? '') + symbol);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer?.trim() || !current) return;
    const userAns    = String(selectedAnswer).trim().toLowerCase();
    const correctAns = String(current.correctAnswer ?? current.answer ?? '').trim().toLowerCase();

    // Forgiving numeric comparison (same logic as mobile)
    const normalize = (s) =>
      s.replace(/\$([^$]+)\$/g, '$1')
       .replace(/π/g, 'pi')
       .replace(/\s+/g, '')
       .replace(/x\s*=\s*/g, '')
       .replace(/[°²³]/g, '')
       .replace(/cm|m²|m³|cm²|cm³/g, '')
       .replace(/≈/g, '')
       .replace(/\*/g, '');

    const extractNums = (s) => s.match(/-?\d+\.?\d*/g)?.join(',') ?? s;
    const userNorm    = normalize(userAns);
    const correctParts = correctAns.split(/\s+or\s+|\s+and\s+|,\s*/i).map(normalize);
    const correct = correctParts.some(
      (part) => userNorm === part || extractNums(userNorm) === extractNums(part)
    );

    setIsCorrect(correct);
    setShowExp(true);
    if (correct) { correctCountRef.current += 1; setCorrectCount(correctCountRef.current); }
  };

  const handleNext = async () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowExp(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      if (isDaily) {
        try {
          await practiceApi.completeDailyChallenge({
            topic, score: correctCountRef.current, total: problems.length,
          });
        } catch { /* ignore */ }
      }
      setShowResults(true);
    }
  };

  // ── Results screen ─────────────────────────────────────────────────────────
  if (showResults) {
    const score = correctCountRef.current;
    const total = problems.length;
    const pct   = Math.round((score / total) * 100);
    const color = pct >= 80 ? '#00a472' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-40 h-40 rounded-full border-8 mx-auto flex flex-col items-center justify-center mb-6 shadow-sm" style={{ borderColor: color }}>
          <span className="text-3xl font-black" style={{ color }}>{score}/{total}</span>
          <span className="text-sm font-semibold text-gray-400">{pct}%</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
        </h2>
        {isDaily && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-4 text-sm font-semibold shadow-2xs"
            style={{ backgroundColor: color + '15', borderColor: color, color }}>
            <IoTrophyOutline size={18} /> Daily Challenge — {score}/{total} correct
          </div>
        )}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs mb-6 text-left">
          <p className="font-bold text-gray-900 mb-3">Breakdown</p>
          {[
            ['Correct answers',   score,         'text-emerald-600'],
            ['Incorrect answers', total - score,  'text-red-500'],
            ['Total problems',    total,          'text-gray-900'],
          ].map(([label, val, cls]) => (
            <div key={label} className="flex justify-between text-sm py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className={`font-bold ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="w-full text-white font-bold py-4 rounded-2xl shadow-md transition-colors"
          style={{ backgroundColor: color }}>
          {isDaily ? 'Back to Practice' : 'Done'}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading problems…</p>
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-gray-500">No problems available for this selection.</p>
        <button onClick={() => navigate(-1)} className="text-purple-600 font-medium">← Go back</button>
      </div>
    );
  }

  // ── Problem view ───────────────────────────────────────────────────────────
  const progress = ((currentIndex + 1) / problems.length) * 100;

  return (
    <>
      {/* Scientific calculator modal */}
      <ScientificCalculator
        visible={showCalc}
        onClose={() => setShowCalc(false)}
        onUseResult={(val) => { setSelected(val); setShowCalc(false); }}
      />

      {/* Leave Practice Warning Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <IoWarningOutline size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Practice Session?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to leave? Your current progress in this practice set will not be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors"
              >
                Keep Practicing
              </button>
              <button
                onClick={() => {
                  setShowQuitModal(false);
                  navigate(-1);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors shadow-md shadow-red-500/20"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <button onClick={handleBackClick}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0 transition-colors">
              <IoArrowBackOutline size={20} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs font-semibold text-purple-600 truncate uppercase tracking-wider">{title ?? 'Practice Problems'}</p>
              <p className="text-sm font-extrabold text-gray-900">Problem {currentIndex + 1} of {problems.length}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${diff.bg} ${diff.text}`}>
              {current?.difficulty ?? difficulty}
            </span>
          </div>
          <div className="mt-3 max-w-3xl mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: diff.hex }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full pb-36">
          {/* Question */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs mb-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <IoHelpCircleOutline size={20} />
                </div>
                <span className="text-sm font-bold text-gray-800">Question</span>
              </div>
              {!showExplanation && (
                <button
                  type="button"
                  onClick={() => setShowCalc(!showCalc)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-100 dark:border-purple-800/40 transition-colors shadow-2xs cursor-pointer"
                >
                  <IoCalculatorOutline size={16} />
                  <span>{showCalc ? 'Hide Calculator' : 'Scientific Calculator'}</span>
                </button>
              )}
            </div>
            <div className="text-lg text-gray-900 font-semibold leading-relaxed">
              <MathText text={current?.question || current?.problem?.text} />
            </div>
          </div>

          {/* Multiple-choice options */}
          {!isFree && (
            <div className="space-y-3 mb-5">
              {opts.map((opt, i) => {
                const val     = typeof opt === 'object' ? opt.text ?? opt.value ?? opt : opt;
                const isSel   = selectedAnswer === val;
                const isRight = String(val).trim().toLowerCase() === String(current.correctAnswer ?? current.answer ?? '').trim().toLowerCase();
                const isWrong = showExplanation && isSel && !isRight;
                let cardCls   = 'bg-white border-gray-200/90 text-gray-800 hover:border-purple-300 hover:bg-purple-50/20';
                let bubbleCls = 'bg-gray-100 text-gray-600';
                if (showExplanation && isRight) { cardCls = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium'; bubbleCls = 'bg-emerald-500 text-white'; }
                else if (isWrong)               { cardCls = 'bg-red-50 border-red-400 text-red-900 font-medium';             bubbleCls = 'bg-red-500 text-white'; }
                else if (isSel)                 { cardCls = 'bg-purple-50 border-purple-500 text-purple-900 font-medium shadow-2xs'; bubbleCls = 'bg-purple-600 text-white'; }
                return (
                  <button key={i} onClick={() => !showExplanation && setSelected(val)} disabled={showExplanation}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-base text-left transition-all ${cardCls}`}>
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${bubbleCls}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-medium"><MathText text={val} /></span>
                    {showExplanation && isRight && <IoCheckmarkCircle size={22} className="shrink-0 text-emerald-600" />}
                    {showExplanation && isWrong && <IoCloseCircle size={22} className="shrink-0 text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Free-response input + calculator button + math toolbar */}
          {isFree && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Type your answer:</span>
              </div>
              <input
                ref={answerRef}
                type="text"
                disabled={showExplanation}
                value={selectedAnswer ?? ''}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="e.g. 7  or  x = 7"
                className={`w-full border-2 rounded-2xl px-5 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  showExplanation && isCorrect  ? 'border-emerald-400 bg-emerald-50/60 text-emerald-900' :
                  showExplanation && !isCorrect ? 'border-red-400 bg-red-50/60 text-red-900' :
                  'border-gray-200 bg-white focus:border-purple-500'
                }`}
              />
              {/* Math symbol toolbar */}
              {!showExplanation && (
                <MathToolbar onInsert={handleInsert} />
              )}
              {/* Correct answer hint for free-response */}
              {showExplanation && !isCorrect && (
                <div className="flex items-center gap-2 mt-3 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl">
                  <IoCheckmarkCircle size={18} className="text-emerald-600 shrink-0" />
                  <div className="text-sm text-emerald-800 font-bold">
                    Correct answer: <MathText text={String(current.correctAnswer ?? current.answer ?? '')} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {(current?.hints?.length > 0) && !showExplanation && (
            <div className="mb-5">
              {!showHint ? (
                <button onClick={() => setShowHint(true)}
                  className="w-full flex items-center justify-center gap-2 bg-amber-50/60 border border-amber-200 text-amber-900 text-sm font-bold py-3 rounded-2xl hover:bg-amber-100/80 transition-colors shadow-2xs">
                  <IoBulbOutline size={20} className="text-amber-500" /> Show Hint
                </button>
              ) : (
                <div className="flex gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-2xl p-4 text-sm text-amber-900 shadow-2xs">
                  <IoBulbOutline size={20} className="shrink-0 text-amber-500 mt-0.5" />
                  <div className="leading-relaxed"><MathText text={current.hints[0]} /></div>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="rounded-3xl overflow-hidden mb-5 border border-gray-100 shadow-2xs">
              <div className={`flex items-center gap-3 px-6 py-4 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {isCorrect
                  ? <IoCheckmarkCircle size={26} className="shrink-0" />
                  : <IoCloseCircle size={26} className="shrink-0" />
                }
                <span className="text-lg font-extrabold">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <div className="bg-white px-6 py-5 space-y-4">
                {current.explanation && (
                  <div className="text-sm text-gray-700 leading-relaxed font-medium">
                    <MathText text={current.explanation} />
                  </div>
                )}
                {current.solution?.steps?.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Solution Steps:</p>
                    <div className="space-y-2.5">
                      {current.solution.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
                          <span className="w-6 h-6 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 mt-0.5 shadow-2xs">{i + 1}</span>
                          <div className="text-sm text-gray-800 leading-relaxed font-medium">
                            <MathText text={step} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {current.solution.finalAnswer && (
                      <div className="text-sm font-extrabold text-purple-700 mt-3 p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-2">
                        <IoSparklesOutline size={18} />
                        <span>Final Answer: <MathText text={current.solution.finalAnswer} /></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-lg z-20">
          <div className="max-w-3xl mx-auto">
            {!showExplanation ? (
              <button onClick={handleSubmit} disabled={!selectedAnswer?.toString().trim()}
                className="w-full bg-purple-600 text-white font-extrabold py-4 rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/20">
                <IoCheckmarkCircle size={22} /> Submit Answer
              </button>
            ) : (
              <button onClick={handleNext}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20">
                {currentIndex < problems.length - 1 ? 'Next Problem' : 'Finish'}
                <IoArrowForwardOutline size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
