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
} from 'react-icons/io5';
import { generateProblems } from '../../services/clientProblemGenerator';
import { practiceApi } from '../../services/api';
import MathToolbar from '../../components/MathToolbar';
import ScientificCalculator from '../../components/ScientificCalculator';
import MathText from '../../components/MathText';

const diffColor = (d) =>
  d === 'Easy' ? { bg: 'bg-emerald-50', text: 'text-emerald-700', hex: '#00a472' } :
  d === 'Hard' ? { bg: 'bg-red-50',     text: 'text-red-600',     hex: '#ef4444' } :
                 { bg: 'bg-yellow-50',  text: 'text-yellow-700',  hex: '#f59e0b' };

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
  const correctCountRef = useRef(0);
  const [correctCount, setCorrectCount]   = useState(0);
  const answerRef = useRef(null);

  useEffect(() => {
    const list = generateProblems(topic ?? 'algebra', category ?? 'mixed', count ?? 10);
    setProblems(list);
    setLoading(false);
  }, []);

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
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <div className="w-40 h-40 rounded-full border-8 mx-auto flex flex-col items-center justify-center mb-6" style={{ borderColor: color }}>
          <span className="text-3xl font-black" style={{ color }}>{score}/{total}</span>
          <span className="text-sm font-semibold text-gray-400">{pct}%</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
        </h2>
        {isDaily && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 mb-4 text-sm font-semibold"
            style={{ backgroundColor: color + '20', borderColor: color, color }}>
            <IoTrophyOutline size={18} /> Daily Challenge — {score}/{total} correct
          </div>
        )}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6 text-left">
          <p className="font-semibold text-gray-900 mb-3">Breakdown</p>
          {[
            ['Correct answers',   score,         'text-emerald-600'],
            ['Incorrect answers', total - score,  'text-red-500'],
            ['Total problems',    total,          'text-gray-900'],
          ].map(([label, val, cls]) => (
            <div key={label} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className={`font-bold ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="w-full text-white font-bold py-3.5 rounded-2xl"
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

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 max-w-xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0">
              <IoArrowBackOutline size={20} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 truncate">{title ?? 'Practice Problems'}</p>
              <p className="text-sm font-bold text-gray-900">Problem {currentIndex + 1} of {problems.length}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${diff.bg} ${diff.text}`}>
              {current?.difficulty ?? difficulty}
            </span>
          </div>
          <div className="mt-3 max-w-xl mx-auto">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: diff.hex }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-xl mx-auto w-full pb-36">
          {/* Question */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <IoHelpCircleOutline size={20} className="text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Question</span>
            </div>
            <div className="text-base text-gray-900 font-medium leading-relaxed">
              <MathText text={current?.question || current?.problem?.text} />
            </div>
          </div>

          {/* Multiple-choice options */}
          {!isFree && (
            <div className="space-y-2.5 mb-4">
              {opts.map((opt, i) => {
                const val     = typeof opt === 'object' ? opt.text ?? opt.value ?? opt : opt;
                const isSel   = selectedAnswer === val;
                const isRight = String(val).trim().toLowerCase() === String(current.correctAnswer ?? current.answer ?? '').trim().toLowerCase();
                const isWrong = showExplanation && isSel && !isRight;
                let cardCls   = 'bg-gray-50 border-gray-200 text-gray-700';
                let bubbleCls = 'bg-gray-100 text-gray-500';
                if (showExplanation && isRight) { cardCls = 'bg-emerald-50 border-emerald-400 text-emerald-800'; bubbleCls = 'bg-emerald-500 text-white'; }
                else if (isWrong)               { cardCls = 'bg-red-50 border-red-400 text-red-800';             bubbleCls = 'bg-red-500 text-white'; }
                else if (isSel)                 { cardCls = 'bg-purple-50 border-purple-400 text-purple-800';    bubbleCls = 'bg-purple-600 text-white'; }
                return (
                  <button key={i} onClick={() => !showExplanation && setSelected(val)} disabled={showExplanation}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${cardCls}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${bubbleCls}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1"><MathText text={val} /></span>
                    {showExplanation && isRight && <IoCheckmarkCircle size={20} className="shrink-0 text-emerald-600" />}
                    {showExplanation && isWrong && <IoCloseCircle size={20} className="shrink-0 text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Free-response input + calculator button + math toolbar */}
          {isFree && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Type your answer:</span>
                {!showExplanation && (
                  <button
                    type="button"
                    onClick={() => setShowCalc(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    <IoCalculatorOutline size={14} /> Calculator
                  </button>
                )}
              </div>
              <input
                ref={answerRef}
                type="text"
                disabled={showExplanation}
                value={selectedAnswer ?? ''}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="e.g. 7  or  x = 7"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  showExplanation && isCorrect  ? 'border-emerald-400 bg-emerald-50' :
                  showExplanation && !isCorrect ? 'border-red-400 bg-red-50' :
                  'border-gray-200 bg-white'
                }`}
              />
              {/* Math symbol toolbar */}
              {!showExplanation && (
                <MathToolbar onInsert={handleInsert} />
              )}
              {/* Correct answer hint for free-response */}
              {showExplanation && !isCorrect && (
                <div className="flex items-center gap-2 mt-2 bg-emerald-50 px-3 py-2 rounded-lg">
                  <IoCheckmarkCircle size={15} className="text-emerald-600 shrink-0" />
                  <div className="text-sm text-emerald-700 font-semibold">
                    Correct answer: <MathText text={String(current.correctAnswer ?? current.answer ?? '')} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {(current?.hints?.length > 0) && !showExplanation && (
            <div className="mb-4">
              {!showHint ? (
                <button onClick={() => setShowHint(true)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-yellow-100 transition-colors">
                  <IoBulbOutline size={18} className="text-yellow-500" /> Show Hint
                </button>
              ) : (
                <div className="flex gap-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 text-sm text-yellow-900">
                  <IoBulbOutline size={16} className="shrink-0 mt-0.5 text-yellow-500" />
                  <div><MathText text={current.hints[0]} /></div>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="rounded-2xl overflow-hidden mb-4 shadow-sm">
              <div className={`flex items-center gap-3 px-5 py-4 ${isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {isCorrect
                  ? <IoCheckmarkCircle size={28} className="text-emerald-600 shrink-0" />
                  : <IoCloseCircle size={28} className="text-red-500 shrink-0" />
                }
                <span className={`text-lg font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <div className="bg-white border border-gray-100 px-5 py-4 space-y-2">
                {current.explanation && (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <MathText text={current.explanation} />
                  </div>
                )}
                {current.solution?.steps?.length > 0 && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Solution Steps:</p>
                    {current.solution.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <MathText text={step} />
                        </div>
                      </div>
                    ))}
                    {current.solution.finalAnswer && (
                      <div className="text-sm font-bold text-purple-700 mt-2 flex items-center gap-1">
                        Final Answer: <MathText text={current.solution.finalAnswer} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg lg:left-60">
          <div className="max-w-xl mx-auto">
            {!showExplanation ? (
              <button onClick={handleSubmit} disabled={!selectedAnswer?.toString().trim()}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <IoCheckmarkCircle size={20} /> Submit Answer
              </button>
            ) : (
              <button onClick={handleNext}
                className="w-full font-bold py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: '#00a472' }}>
                {currentIndex < problems.length - 1 ? 'Next Problem' : 'Finish'}
                <IoArrowForwardOutline size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
