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

function FormattedSpan({ text }) {
  if (!text) return null;

  // Split by line breaks to preserve paragraph formatting
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lIndex) => {
        // Split line by bold **...** and inline code `...`
        const chunks = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

        return (
          <span key={lIndex}>
            {chunks.map((chunk, cIndex) => {
              if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
                return <strong key={cIndex} className="font-bold">{chunk.slice(2, -2)}</strong>;
              }
              if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
                return (
                  <code key={cIndex} className="bg-gray-100 text-purple-700 font-mono text-xs px-1.5 py-0.5 rounded">
                    {chunk.slice(1, -1)}
                  </code>
                );
              }
              return <span key={cIndex}>{chunk}</span>;
            })}
            {lIndex < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

export default function MathText({ text, className = '' }) {
  if (text == null || text === '') return null;

  const str = String(text);

  // Match KaTeX math blocks and inline delimiters:
  // 1. $$...$$ (Block)
  // 2. \[...\] (Block)
  // 3. $...$ (Inline)
  // 4. \(...\) (Inline)
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  const parts = str.split(regex);

  return (
    <span className={`math-text-container ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Block math: $$...$$ or \[...\]
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        }
        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        }

        // Inline math: $...$ or \(...\)
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          return <InlineMath key={index} math={part.slice(2, -2)} />;
        }

        // Non-math text: Auto-wrap unwrapped latex commands like \frac{a}{b} or \sqrt{x} if present
        const normalizedPart = part.replace(
          /(\\frac\{[^{}]+\}\{[^{}]+\}|\\sqrt\{[^{}]+\}|\\sqrt\[[^{}]*\]\{[^{}]+\}|\\int_\{[^{}]+\}\^\{[^{}]+\}|\\sum_\{[^{}]+\}\^\{[^{}]+\})/g,
          (_, match) => `$${match}$`
        );

        if (normalizedPart !== part) {
          const subParts = normalizedPart.split(/(\$[^\$\n]+?\$)/g);
          return subParts.map((sub, subIdx) => {
            if (sub.startsWith('$') && sub.endsWith('$')) {
              return <InlineMath key={`${index}-${subIdx}`} math={sub.slice(1, -1)} />;
            }
            return <FormattedSpan key={`${index}-${subIdx}`} text={sub} />;
          });
        }

        return <FormattedSpan key={index} text={part} />;
      })}
    </span>
  );
}