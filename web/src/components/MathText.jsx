import { useEffect, useRef } from 'react';
import katex from 'katex';

function BlockMath({ math }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math.trim(), ref.current, {
        displayMode: true,
        throwOnError: false,
      });
    } catch (e) {
      if (ref.current) ref.current.textContent = math;
    }
  }, [math]);

  return <div ref={ref} className="katex-block my-2 overflow-x-auto overflow-y-hidden max-w-full text-center" />;
}

function InlineMath({ math }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math.trim(), ref.current, {
        displayMode: false,
        throwOnError: false,
      });
    } catch (e) {
      if (ref.current) ref.current.textContent = math;
    }
  }, [math]);

  return <span ref={ref} className="katex-inline inline-block px-0.5" />;
}

const SUB_DIGITS = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
function replaceSubscriptDigits(str) {
  if (!str) return '';
  return str.replace(/(?<![a-zA-Z0-9_\\])\b([a-zA-Z])([0-9]+)\b/g, (match, letter, digits) => {
    const sub = digits.split('').map(d => SUB_DIGITS[d] || d).join('');
    return `${letter}${sub}`;
  });
}

/**
 * Automatically isolates pure math expressions (equations, exponents, roots, fractions)
 * into standard LaTeX $...$ delimiters while preserving English prose text as normal text.
 */
function normalizeMathInText(rawText) {
  if (!rawText) return '';
  let str = String(rawText);

  // If text already contains KaTeX math delimiters ($...$ or \(...\)), return with subscript digits applied to non-math parts
  if (/\$[^\$\n]+?\$|\\\([\s\S]*?\\\)/.test(str)) {
    return replaceSubscriptDigits(str);
  }

  const mathTriggerRegex = /[\^±√=]|\blog_?[0-9a-zA-Z]*|\b[a-zA-Z0-9_()]+\s*\/\s*[a-zA-Z0-9_()]+\b/i;
  if (!mathTriggerRegex.test(str)) {
    return replaceSubscriptDigits(str);
  }

  const formatFormulaOnly = (expr) => {
    let s = expr.trim();
    let punct = '';
    const matchPunct = s.match(/([.,;:?!])$/);
    if (matchPunct && !s.endsWith(')')) {
      punct = matchPunct[1];
      s = s.slice(0, -1).trim();
    }

    // Clean symbols
    s = s.replace(/±|\+-/g, '\\pm ');
    s = s.replace(/×/g, '\\times ').replace(/÷/g, '\\div ');
    s = s.replace(/\^?\\?(degree|degrees|circ)\b/gi, '^{\\circ}').replace(/°/g, '^{\\circ}');

    // Single-letter variable subscripts: x1 -> x_{1}, y1 -> y_{1}, x2 -> x_{2}, y2 -> y_{2}
    s = s.replace(/(?<![a-zA-Z0-9_\\])\b([a-zA-Z])([0-9]+)\b/g, '$1_{$2}');

    // Roots: √((...)) or √( ... ) or √...
    s = s.replace(/√\s*\(\s*\(\s*([^)]+)\s*\)\s*\)/g, '\\sqrt{$1}');
    s = s.replace(/√\s*\(\s*([^)]+)\s*\)/g, '\\sqrt{$1}');
    s = s.replace(/√\s*([a-zA-Z0-9_]+)/g, '\\sqrt{$1}');

    s = s.replace(/\(\s*-b\s*\\pm\s*\\sqrt\{([^}]+)\}\s*\)\s*\/\s*\(?\s*([a-zA-Z0-9^]+)\s*\)?/g, '\\frac{-b \\pm \\sqrt{$1}}{$2}');
    s = s.replace(/\\sqrt\{\s*\(?\s*([^/]+?)\s*\/\s*([^)]+?)\s*\)?\s*\}/g, '\\sqrt{\\frac{$1}{$2}}');

    // Simple non-recursive fraction regex
    s = s.replace(/\(\s*([a-zA-Z0-9_+\-*()\s]+?)\s*\/\s*([a-zA-Z0-9_+\-*()\s]+?)\s*\)/g, (match, num, den) => {
      let n = num.trim();
      let d = den.trim();
      if (n.startsWith('(') && n.endsWith(')')) n = n.slice(1, -1).trim();
      return `\\frac{${n}}{${d}}`;
    });

    s = s.replace(/(\b[a-zA-Z0-9_]+(?:\([^()]*\))?)\s*\/\s*(\b[a-zA-Z0-9_]+(?:\([^()]*\))?)/g, '\\frac{$1}{$2}');
    s = s.replace(/(\\frac\s*\{[^{}]*\}\s*\{[^}]+\})\)/g, (m, p1) => p1);

    s = s.replace(/(\b\d+)\s*\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1\\left(\\frac{$2}{$3}\\right)');
    s = s.replace(/(\b\d+)\s+([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)/g, '$1\\left(\\frac{$2}{$3}\\right)');
    s = s.replace(/\\left\(\\left\(/g, '\\left(').replace(/\\right\)\\right\)/g, '\\right)');

    s = s.replace(/(?<!\\)\b(sin|cos|tan|asin|acos|atan|csc|sec|cot)\b/g, (m) => '\\' + m);

    s = s.replace(/\blog_?([0-9a-zA-Z]+)\s*\(([^)]+)\)/gi, '\\log_{$1}($2)');
    s = s.replace(/\blog_?([0-9a-zA-Z]+)\s+([0-9a-zA-Z]+)/gi, '\\log_{$1}{$2}');
    s = s.replace(/([a-zA-Z0-9_])\^?\s*\(\s*-\s*([0-9a-zA-Z]+)\s*\)/g, '$1^{-$2}');
    s = s.replace(/([a-zA-Z0-9_])\^?\s*\{\s*\(?\s*-\s*([0-9a-zA-Z]+)\s*\)?\s*\}/g, '$1^{-$2}');
    s = s.replace(/([a-zA-Z0-9_])\^\s*-\s*([0-9a-zA-Z]+)/g, '$1^{-$2}');

    s = s.replace(/([a-zA-Z0-9_)]+)\^([a-zA-Z0-9_]+)/g, '$1^{$2}');

    let openCount = (s.match(/\(/g) || []).length;
    let closeCount = (s.match(/\)/g) || []).length;
    while (closeCount > openCount && s.endsWith(')')) {
      s = s.slice(0, -1).trim();
      closeCount--;
    }

    s = s.replace(/\s+/g, ' ').trim();
    return `$${s}$` + punct;
  };

  const mathKeywords = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'lim', 'det', 'min', 'max']);

  // Line by line non-backtracking parsing
  const lines = str.split('\n');
  const processedLines = lines.map((line) => {
    const isMathFormula = /[\^±√=]|\b[a-zA-Z0-9_()]+\s*\/\s*[a-zA-Z0-9_()]+\b/i.test(line);
    const words = line.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const proseWords = words.filter(w => !mathKeywords.has(w.toLowerCase()));

    if (isMathFormula && proseWords.length === 0) {
      return formatFormulaOnly(line);
    }

    let formattedLine = line.replace(/(\b[a-zA-Z0-9_()]+\s*=\s*[a-zA-Z0-9_()+\-*/\s]+\b)/g, (match) => {
      if (/[\^±√=+\-*/]/i.test(match)) {
        return formatFormulaOnly(match);
      }
      return match;
    });

    return replaceSubscriptDigits(formattedLine);
  });

  return processedLines.join('\n');
}

/**
 * Render inline text with KaTeX math, bold, inline code formatting
 */
function InlineFormatted({ text }) {
  if (!text) return null;

  const processedText = normalizeMathInText(text);

  // Split by KaTeX math delimiters ($...$ or \(...\))
  const mathRegex = /(\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;
  const parts = String(processedText).split(mathRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Inline KaTeX math
        if ((part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'))) {
          const mathContent = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
          return <InlineMath key={index} math={mathContent} />;
        }

        // Split by bold (**...**) and inline code (`...`)
        const chunks = part.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

        return (
          <span key={index}>
            {chunks.map((chunk, cIndex) => {
              if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
                return <strong key={cIndex} className="font-bold">{chunk.slice(2, -2)}</strong>;
              }
              if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
                return (
                  <code key={cIndex} className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-mono text-xs px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800/40">
                    {chunk.slice(1, -1)}
                  </code>
                );
              }
              return <span key={cIndex}>{chunk}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

/**
 * Render Markdown Table
 */
function MarkdownTable({ tableLines }) {
  if (!tableLines || tableLines.length === 0) return null;

  // Extract valid pipe rows
  const cleanRows = tableLines
    .map(line => line.trim())
    .filter(line => line.startsWith('|') || line.endsWith('|'))
    .map(line => {
      // Split by |, remove first and last empty elements
      const cells = line.split('|');
      if (cells.length > 1 && cells[0].trim() === '') cells.shift();
      if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
      return cells.map(c => c.trim());
    });

  if (cleanRows.length === 0) return null;

  // Header is row 0
  const headers = cleanRows[0];
  
  // Row 1 might be divider row (|---|---|)
  const isDivider = cleanRows[1] && cleanRows[1].every(cell => /^:?-+:?$/.test(cell.replace(/\s+/g, '')));
  const bodyRows = isDivider ? cleanRows.slice(2) : cleanRows.slice(1);

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-gray-200/80 dark:border-[#2d3748] bg-white dark:bg-[#1a2333] shadow-xs">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-gray-100/70 dark:bg-[#252f40] font-bold text-gray-900 dark:text-white">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-2.5 border-b border-r last:border-r-0 border-gray-200/80 dark:border-[#2d3748]">
                <InlineFormatted text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/80 dark:divide-[#2d3748]">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-[#202b3d] transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 border-r last:border-r-0 border-gray-200/80 dark:border-[#2d3748] text-gray-800 dark:text-gray-200">
                  <InlineFormatted text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MathText({ text, className = '' }) {
  if (text == null || text === '') return null;

  const str = String(text);

  // Split into KaTeX block math vs non-block text first
  const blockMathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
  const blocks = str.split(blockMathRegex);

  return (
    <div className={`math-text-container space-y-1.5 ${className}`}>
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        // Render Block Math $$...$$ or \[...\]
        if (block.startsWith('$$') && block.endsWith('$$')) {
          return <BlockMath key={bIdx} math={block.slice(2, -2)} />;
        }
        if (block.startsWith('\\[') && block.endsWith('\\]')) {
          return <BlockMath key={bIdx} math={block.slice(2, -2)} />;
        }

        // Process standard text block line by line
        const lines = block.split('\n');
        const elements = [];
        let tableBuffer = [];

        const flushTableBuffer = () => {
          if (tableBuffer.length > 0) {
            elements.push(<MarkdownTable key={`table-${elements.length}`} tableLines={[...tableBuffer]} />);
            tableBuffer = [];
          }
        };

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          // Check if table row
          if (trimmed.startsWith('|') && trimmed.includes('|')) {
            tableBuffer.push(trimmed);
            return;
          }

          // If line is not table, flush any accumulated table rows
          flushTableBuffer();

          // Horizontal rule: --- or ***
          if (/^(---|\*\*\*|___)$/.test(trimmed)) {
            elements.push(<hr key={`hr-${lIdx}`} className="my-3 border-t border-gray-200 dark:border-zinc-700" />);
            return;
          }

          // Headings: #, ##, ###, ####
          if (/^#{1,6}\s+/.test(trimmed)) {
            const level = trimmed.match(/^#+/)[0].length;
            const headingText = trimmed.replace(/^#+\s+/, '');
            const headingClasses = {
              1: 'text-lg font-extrabold text-gray-900 dark:text-white mt-4 mb-2',
              2: 'text-base font-bold text-gray-900 dark:text-white mt-3.5 mb-1.5',
              3: 'text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1',
              4: 'text-sm font-semibold text-gray-900 dark:text-white mt-2 mb-1',
            };
            elements.push(
              <div key={`h-${lIdx}`} className={headingClasses[level] || headingClasses[4]}>
                <InlineFormatted text={headingText} />
              </div>
            );
            return;
          }

          // Bullet list items: - item or * item
          if (/^[-*]\s+/.test(trimmed)) {
            const listText = trimmed.replace(/^[-*]\s+/, '');
            elements.push(
              <div key={`li-${lIdx}`} className="flex items-start gap-2 ml-2 my-0.5">
                <span className="text-purple-500 font-bold select-none">•</span>
                <div className="flex-1">
                  <InlineFormatted text={listText} />
                </div>
              </div>
            );
            return;
          }

          // Numbered list items: 1. item
          if (/^\d+\.\s+/.test(trimmed)) {
            const num = trimmed.match(/^\d+/)[0];
            const listText = trimmed.replace(/^\d+\.\s+/, '');
            elements.push(
              <div key={`nli-${lIdx}`} className="flex items-start gap-2 ml-2 my-0.5">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xs select-none">{num}.</span>
                <div className="flex-1">
                  <InlineFormatted text={listText} />
                </div>
              </div>
            );
            return;
          }

          // Empty line
          if (!trimmed) {
            elements.push(<div key={`blank-${lIdx}`} className="h-1" />);
            return;
          }

          // Regular paragraph line
          elements.push(
            <div key={`line-${lIdx}`}>
              <InlineFormatted text={line} />
            </div>
          );
        });

        // Flush any remaining table at end of block
        flushTableBuffer();

        return <div key={bIdx}>{elements}</div>;
      })}
    </div>
  );
}