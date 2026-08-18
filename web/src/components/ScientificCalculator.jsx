/**
 * ScientificCalculator — ported from mobile/src/components/ScientificCalculator.tsx
 *
 * A bottom-sheet modal scientific calculator with:
 *  - Basic arithmetic: + - × ÷
 *  - Trig: sin, cos, tan, asin, acos, atan
 *  - Powers / roots: x², xʸ, √, ∛
 *  - Constants: π, e
 *  - Log: log, ln
 *  - Degree / Radian toggle
 *  - "Use Result" button — pastes the result into the answer field
 */

import { useState, useEffect } from 'react';

// ─── Safe expression evaluator ────────────────────────────────────────────────
function safeEval(expr, mode, lastAns = '0') {
  try {
    if (!expr || typeof expr !== 'string') return 'Error';

    const _sin   = (x) => (mode === 'DEG' ? Math.sin((x * Math.PI) / 180) : Math.sin(x));
    const _cos   = (x) => (mode === 'DEG' ? Math.cos((x * Math.PI) / 180) : Math.cos(x));
    const _tan   = (x) => (mode === 'DEG' ? Math.tan((x * Math.PI) / 180) : Math.tan(x));
    const _asin  = (x) => (mode === 'DEG' ? (Math.asin(x) * 180) / Math.PI : Math.asin(x));
    const _acos  = (x) => (mode === 'DEG' ? (Math.acos(x) * 180) / Math.PI : Math.acos(x));
    const _atan  = (x) => (mode === 'DEG' ? (Math.atan(x) * 180) / Math.PI : Math.atan(x));
    const _log   = (y, b) => (b === undefined ? Math.log10(y) : Math.log(y) / Math.log(b));
    const _ln    = Math.log;
    const _log_b = (y, b) => (b === undefined ? Math.log10(y) : Math.log(y) / Math.log(b));
    const _sqrt  = Math.sqrt;
    const _cbrt  = Math.cbrt;

    const safeAns = (lastAns && lastAns !== 'Error') ? lastAns : '0';

    let e = expr
      .replace(/\bAns\b/gi, `(${safeAns})`)
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`)
      .replace(/²/g, '**2')
      .replace(/³/g, '**3')
      .replace(/\^/g, '**')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100')
      .replace(/\basin\(/g, '_asin(')
      .replace(/\bacos\(/g, '_acos(')
      .replace(/\batan\(/g, '_atan(')
      .replace(/\bsin\(/g,  '_sin(')
      .replace(/\bcos\(/g,  '_cos(')
      .replace(/\btan\(/g,  '_tan(')
      .replace(/\blog_?(\d+)\(([^)]+)\)/g, '_log_b($2, $1)')
      .replace(/\blog_b\(/g, '_log_b(')
      .replace(/\blog\(/g,  '_log(')
      .replace(/\bln\(/g,   '_ln(')
      .replace(/√\(/g,     '_sqrt(')
      .replace(/∛\(/g,     '_cbrt(')
      .replace(/√/g,      '_sqrt(')
      .replace(/∛/g,      '_cbrt(');

    // Implicit multiplication: e.g. 2( -> 2*(, )( -> )*(, )2 -> )*2, 2_sin -> 2*_sin
    e = e
      .replace(/(\d|\))\s*(\()/g, '$1*$2')
      .replace(/(\d|\))\s*(_sin|_cos|_tan|_asin|_acos|_atan|_log_b|_log|_ln|_sqrt|_cbrt)/g, '$1*$2')
      .replace(/(\))\s*(\d)/g, '$1*$2');

    // Auto-close missing parentheses
    const openParens = (e.match(/\(/g) || []).length;
    const closeParens = (e.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      e += ')'.repeat(openParens - closeParens);
    }

    // Only allow safe characters
    if (/[^0-9+\-*/().Math\s,_a-zA-Z]/.test(e)) {
      return 'Error';
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('_sin', '_cos', '_tan', '_asin', '_acos', '_atan', '_log_b', '_log', '_ln', '_sqrt', '_cbrt', `"use strict"; return (${e});`);
    const result = fn(_sin, _cos, _tan, _asin, _acos, _atan, _log_b, _log, _ln, _sqrt, _cbrt);

    if (typeof result !== 'number' || !isFinite(result)) return 'Error';

    const rounded = parseFloat(result.toPrecision(10));
    return parseFloat(rounded.toFixed(4)).toString();
  } catch {
    return 'Error';
  }
}

// ─── Button component ─────────────────────────────────────────────────────────
function Btn({ label, onClick, className }) {
  const isLong = typeof label === 'string' && label.length >= 4;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-11 rounded-xl ${isLong ? 'text-[11px] px-0.5' : 'text-xs sm:text-sm'} font-semibold active:scale-95 transition-transform ${className}`}
    >
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScientificCalculator({ isOpen, visible, onClose, onUseResult }) {
  const isVisible = Boolean(isOpen ?? visible);
  const [display,        setDisplay]        = useState('0');
  const [expression,     setExpression]     = useState('');
  const [angleMode,      setAngleMode]      = useState('DEG');
  const [justEvaluated,  setJustEvaluated]  = useState(false);
  const [lastAns,        setLastAns]        = useState('0');

  // Close on Escape
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const append = (val) => {
    if (justEvaluated) {
      if ('0123456789.πe(Ans'.includes(val)) {
        const next = val === '0' ? '0' : val;
        setDisplay(next); setExpression(next);
      } else {
        setDisplay(display + val); setExpression(display + val);
      }
      setJustEvaluated(false);
      return;
    }
    const newExpr = expression === '0' && !['/', '*', '+', '-', '×', '÷', '.'].includes(val)
      ? val
      : expression + val;
    setExpression(newExpr);
    setDisplay(newExpr);
  };

  const appendFn = (fn) => {
    const newExpr = justEvaluated ? fn + '(' : expression + fn + '(';
    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  };

  const calculate = () => {
    if (!expression || expression === 'Error') return;
    const result = safeEval(expression, angleMode, lastAns);
    setDisplay(result);
    setExpression(result);
    setJustEvaluated(true);
    if (result !== 'Error') {
      setLastAns(result);
    }
  };

  const clear = () => { setDisplay('0'); setExpression(''); setJustEvaluated(false); };

  const backspace = () => {
    if (justEvaluated) { clear(); return; }

    const fnTokens = ['log_b(', 'asin(', 'acos(', 'atan(', 'sin(', 'cos(', 'tan(', 'log(', 'ln(', 'Ans'];
    for (const token of fnTokens) {
      if (expression.endsWith(token)) {
        const next = expression.slice(0, -token.length);
        setExpression(next);
        setDisplay(next || '0');
        return;
      }
    }

    const next = expression.slice(0, -1);
    setExpression(next);
    setDisplay(next || '0');
  };

  const useResult = () => {
    if (display !== 'Error' && display !== '0' && onUseResult) {
      onUseResult(display);
      onClose();
    }
  };

  // Shorthand helpers
  const num = (v) => <Btn key={v} label={v} onClick={() => append(v)} className="bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />;
  const op  = (l, v) => <Btn key={l} label={l} onClick={() => append(v ?? l)} className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold cursor-pointer" />;
  const fn  = (l, f) => <Btn key={l} label={l} onClick={() => appendFn(f ?? l)} className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer" />;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-gray-50 dark:bg-[#1a2333] border-t sm:border border-gray-200 dark:border-[#2d3748] rounded-t-3xl sm:rounded-3xl shadow-2xl pb-6 overflow-hidden animate-in slide-in-from-bottom duration-200 sm:zoom-in-95">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#2d3748]">
          <span className="text-base font-bold text-gray-900 dark:text-white">Scientific Calculator</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}
              className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide cursor-pointer"
            >
              {angleMode}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d3748] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mx-4 mt-3 mb-2 bg-white dark:bg-[#0d131f] border border-gray-200 dark:border-[#2d3748] rounded-2xl px-4 py-3 min-h-[72px] flex flex-col justify-end shadow-inner">
          <p className="text-xs text-gray-400 dark:text-gray-400 text-right truncate">{expression || ' '}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white text-right truncate">{display}</p>
        </div>

        {/* Format Helper Hint Banner - Only visible when log_b is present in expression */}
        {expression.includes('log_b') && (
          <div className="mx-4 mb-2.5 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 animate-in fade-in duration-150">
            <span className="font-medium">Format: <strong className="font-bold">log_b(value, base)</strong></span>
            <span className="text-blue-500 dark:text-blue-400">e.g. log_b(8, 2) = 3</span>
          </div>
        )}

        <div className="px-3 space-y-1.5">
          <div className="flex gap-1.5">
            {fn('sin')}{fn('cos')}{fn('tan')}{fn('asin')}{fn('acos')}{fn('atan')}
          </div>

          <div className="flex gap-1.5">
            {fn('√')}{fn('∛')}
            <Btn label="x²" onClick={() => append('²')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 cursor-pointer" />
            <Btn label="xʸ" onClick={() => append('^')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 cursor-pointer" />
            {fn('log')}{fn('ln')}{fn('log_b')}
          </div>

          <div className="flex gap-1.5">
            <Btn label="π"   onClick={() => append('π')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 cursor-pointer" />
            <Btn label="e"   onClick={() => append('e')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 cursor-pointer" />
            <Btn label=","   onClick={() => append(',')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />
            <Btn label="Ans" onClick={() => append('Ans')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 cursor-pointer" />
            <Btn label="("   onClick={() => append('(')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />
            <Btn label=")"   onClick={() => append(')')} className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />
            <Btn label="⌫"   onClick={backspace}         className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-300 cursor-pointer" />
            <Btn label="AC"  onClick={clear}             className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-300 cursor-pointer" />
          </div>

          <div className="flex gap-1.5">{num('7')}{num('8')}{num('9')}{op('÷')}</div>
          <div className="flex gap-1.5">{num('4')}{num('5')}{num('6')}{op('×')}</div>
          <div className="flex gap-1.5">{num('1')}{num('2')}{num('3')}{op('-')}</div>
          <div className="flex gap-1.5">
            {num('0')}{num('.')}
            <Btn label="=" onClick={calculate} className="flex-1 h-11 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer" />
            {op('+')}
          </div>
        </div>

        {/* Use Result */}
        {onUseResult && (
          <div className="px-4 mt-3">
            <button
              type="button"
              onClick={useResult}
              disabled={display === 'Error'}
              className="w-full h-12 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Use Result ({display})
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
