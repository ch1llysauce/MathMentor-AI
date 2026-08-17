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

/**
 * Render inline text with KaTeX math, bold, inline code formatting
 */
function InlineFormatted({ text }) {
  if (!text) return null;

  // Split by KaTeX math delimiters ($...$ or \(...\))
  const mathRegex = /(\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;
  const parts = String(text).split(mathRegex);

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
                  <code key={cIndex} className="bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-purple-300 font-mono text-xs px-1.5 py-0.5 rounded border border-purple-100 dark:border-zinc-700">
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
    <div className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-zinc-800 font-bold text-gray-900 dark:text-gray-100">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-2.5 border-b border-r last:border-r-0 border-gray-200 dark:border-zinc-700">
                <InlineFormatted text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 border-r last:border-r-0 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200">
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