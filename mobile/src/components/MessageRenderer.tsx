/**
 * MessageRenderer
 *
 * Renders AI/lesson chat message text with:
 * - **bold** markdown support
 * - Display LaTeX blocks: $$...$$ via KaTeX WebView (fixed height, no jiggle)
 * - Inline LaTeX: $...$ rendered as styled monospace text (no WebView — avoids jiggle)
 * - Numbered lists (1. item)
 * - Bullet lists (- item or * item)
 * - Plain text with dark mode support
 *
 * Usage:
 *   <MessageRenderer content={message.content} isUser={false} textColor="#091426" />
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  content: string;
  isUser?: boolean;
  textColor?: string;
  fontSize?: number;
}

// ─── KaTeX display block HTML ─────────────────────────────────────────────────
function makeKatexHtml(latex: string, bgColor: string, fgColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
  html, body { margin:0; padding:0; background:${bgColor}; overflow:hidden; }
  #math { padding: 6px 4px; display:flex; justify-content:center; }
  .katex { font-size:15px; color:${fgColor}; }
  .katex-display { margin:0; }
</style>
</head>
<body>
<div id="math"></div>
<script>
  try {
    katex.render(${JSON.stringify(latex)}, document.getElementById('math'), {
      displayMode: true,
      throwOnError: false
    });
  } catch(e) {
    document.getElementById('math').innerText = ${JSON.stringify(latex)};
  }
  // Post rendered height once, after fonts settle
  setTimeout(function() {
    var h = document.getElementById('math').scrollHeight;
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(h + 16));
  }, 120);
</script>
</body>
</html>`;
}

// ─── Display LaTeX block (WebView, fixed initial height, one resize) ──────────
function DisplayLatexBlock({
  latex,
  bgColor,
  fgColor,
}: {
  latex: string;
  bgColor: string;
  fgColor: string;
}) {
  const [height, setHeight] = useState(56);
  const html = useMemo(
    () => makeKatexHtml(latex, bgColor, fgColor),
    // Only recompute when content or colors actually change — not on every parent re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latex, bgColor, fgColor]
  );

  return (
    <WebView
      source={{ html }}
      style={{ width: '100%', height, backgroundColor: 'transparent' }}
      scrollEnabled={false}
      originWhitelist={['*']}
      javaScriptEnabled
      onMessage={(e) => {
        const h = parseInt(e.nativeEvent.data, 10);
        if (!isNaN(h) && h > 0) setHeight(h);
      }}
    />
  );
}

// ─── Block types ──────────────────────────────────────────────────────────────
type Block =
  | { type: 'display-latex'; latex: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; n: number; text: string }
  | { type: 'paragraph'; text: string };

// ─── Parse $$...$$ display blocks, then split remainder into line-blocks ──────
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = displayRe.exec(content)) !== null) {
    if (m.index > last) parseLineBlocks(content.slice(last, m.index), blocks);
    blocks.push({ type: 'display-latex', latex: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < content.length) parseLineBlocks(content.slice(last), blocks);
  return blocks;
}

function parseLineBlocks(text: string, out: Block[]) {
  let para = '';
  const flush = () => {
    const t = para.trim();
    if (t) out.push({ type: 'paragraph', text: t });
    para = '';
  };
  for (const raw of text.split('\n')) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const bullet = t.match(/^[-*•]\s+(.+)$/);
    const num    = t.match(/^(\d+)\.\s+(.+)$/);
    if (bullet)      { flush(); out.push({ type: 'bullet',   text: bullet[1] }); }
    else if (num)    { flush(); out.push({ type: 'numbered', n: parseInt(num[1]), text: num[2] }); }
    else             { para += (para ? ' ' : '') + t; }
  }
  flush();
}

// ─── Inline span renderer: **bold**, $inline LaTeX$ (as styled text), plain ──
function InlineText({
  text,
  color,
  fontSize,
}: {
  text: string;
  color: string;
  fontSize: number;
}) {
  // Split on **bold** and $inline$ patterns
  const parts: Array<{ t: 'plain' | 'bold' | 'math'; v: string }> = [];
  const re = /(\*\*(.+?)\*\*|\$([^$\n]+?)\$)/g;
  let last = 0, m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'plain', v: text.slice(last, m.index) });
    if (m[0].startsWith('**')) parts.push({ t: 'bold', v: m[2] });
    else                       parts.push({ t: 'math', v: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: 'plain', v: text.slice(last) });

  return (
    <Text style={{ color, fontSize, lineHeight: fontSize * 1.6, flexShrink: 1 }}>
      {parts.map((p, i) => {
        if (p.t === 'bold') {
          return <Text key={i} style={{ fontWeight: '700', color }}>{p.v}</Text>;
        }
        if (p.t === 'math') {
          // Inline math: monospace block — avoids WebView jiggle entirely
          return (
            <Text key={i} style={{ fontFamily: 'monospace', color, backgroundColor: 'rgba(128,128,128,0.12)', fontSize: fontSize - 1 }}>
              {' '}{p.v}{' '}
            </Text>
          );
        }
        return <Text key={i}>{p.v}</Text>;
      })}
    </Text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MessageRenderer({
  content,
  isUser = false,
  textColor,
  fontSize = 15,
}: Props) {
  const { darkMode } = useTheme();

  // Resolve colors
  const resolvedTextColor = textColor ?? (isUser ? '#ffffff' : (darkMode ? '#f0f0f0' : '#091426'));
  const latexBg  = isUser ? '#4b41e1' : (darkMode ? '#1a1a1a' : '#ffffff');
  const latexFg  = isUser ? '#ffffff' : (darkMode ? '#f0f0f0' : '#091426');

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'display-latex') {
          return (
            <View key={i} style={styles.displayLatexWrap}>
              <DisplayLatexBlock latex={block.latex} bgColor={latexBg} fgColor={latexFg} />
            </View>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bulletDot, { color: resolvedTextColor, fontSize }]}>{'•'}</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedTextColor} fontSize={fontSize} />
              </View>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bulletDot, { color: resolvedTextColor, fontSize }]}>{block.n}.</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedTextColor} fontSize={fontSize} />
              </View>
            </View>
          );
        }

        // paragraph
        return (
          <View key={i} style={i > 0 ? styles.paraGap : undefined}>
            <InlineText text={block.text} color={resolvedTextColor} fontSize={fontSize} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    gap: 4,
  },
  displayLatexWrap: {
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    minWidth: 20,
    lineHeight: 24,
  },
  listContent: {
    flex: 1,
  },
  paraGap: {
    marginTop: 4,
  },
});
