import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoSendOutline,
  IoSparklesOutline,
  IoPersonOutline,
  IoTrashOutline,
  IoBookOutline,
  IoCloudDoneOutline,
  IoArrowForwardCircleOutline,
} from 'react-icons/io5';
import { tutorApi, learningApi } from '../../services/api';

export default function LessonChat() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonTitle, topic, subtopic } = location.state ?? {};

  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState(undefined);
  const [deleting, setDeleting]             = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const quickSuggestions = [
    `Can you give me a practice problem for ${lessonTitle}?`,
    `What are the key formulas I need to know for this lesson?`,
    `Can you explain this with a real-world example?`,
    `What mistakes do students commonly make in this topic?`,
  ];

  // ── Load persisted conversation ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await learningApi.getLessonConversation(lessonId);
        const d = data?.data ?? data;
        if (d?.conversationId && d?.messages?.length > 0) {
          setConversationId(d.conversationId);
          setMessages([
            {
              id: 'welcome-back',
              role: 'assistant',
              content: `Welcome back! 👋 Continuing your conversation about **${lessonTitle}**.\n\nFeel free to pick up where you left off or ask something new.`,
              timestamp: new Date().toISOString(),
            },
            ...d.messages.map((m, i) => ({
              id: `history-${i}`,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })),
          ]);
        } else {
          setMessages([welcomeMessage()]);
        }
      } catch {
        setMessages([welcomeMessage()]);
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
  }, [lessonId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const welcomeMessage = () => ({
    id: 'welcome',
    role: 'assistant',
    content: `Hi! I'm your AI tutor for this lesson. 📚\n\nYou're studying **${lessonTitle ?? 'this lesson'}** — part of **${topic ?? ''} › ${subtopic ?? ''}**.\n\nAsk me anything about this lesson — I can explain concepts, walk through examples, give you practice problems, or help clarify anything confusing. What would you like to explore?`,
    timestamp: new Date().toISOString(),
  });

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Prefix first message with lesson context
    const priorUser = messages.filter((m) => m.role === 'user');
    const contextual = priorUser.length === 0
      ? `I'm studying "${lessonTitle}" (${topic} - ${subtopic}). ${msg}`
      : msg;

    try {
      const { data } = await tutorApi.chat({ message: contextual, conversationId });
      const reply   = data?.message ?? data?.response ?? data?.content ?? 'No response.';
      const newConvId = data?.conversationId ?? data?.data?.conversationId;
      if (newConvId) setConversationId(newConvId);

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: data?.timestamp ?? new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);

      // Persist to MongoDB (fire-and-forget)
      if (newConvId) {
        learningApi.saveLessonMessage(lessonId, {
          conversationId: newConvId,
          userMessage: msg,
          assistantMessage: reply,
        }).catch(() => {});
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Delete conversation ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!conversationId || !window.confirm('Delete this conversation? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await learningApi.deleteLessonConversation(lessonId);
      setConversationId(undefined);
      setMessages([{
        id: 'welcome-fresh',
        role: 'assistant',
        content: `Chat cleared! 🗑️ Starting fresh on **${lessonTitle}**.\n\nWhat would you like to explore?`,
        timestamp: new Date().toISOString(),
      }]);
    } catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  const showSuggestions = messages.length === 1 && messages[0].id === 'welcome' && !loading;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0"
          >
            <IoArrowBackOutline size={20} />
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <IoSparklesOutline size={18} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">Ask AI Tutor</p>
              <p className="text-xs text-gray-400 truncate">{lessonTitle}</p>
            </div>
          </div>

          {conversationId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 shrink-0"
              title="Delete conversation"
            >
              {deleting
                ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                : <IoTrashOutline size={18} />
              }
            </button>
          )}
        </div>

        {/* Context bar */}
        <div className="flex items-center gap-2 mt-2 px-1 max-w-2xl mx-auto">
          <IoBookOutline size={13} className="text-purple-600 shrink-0" />
          <p className="text-xs text-gray-500 flex-1 truncate">{topic} › {subtopic}</p>
          {conversationId && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <IoCloudDoneOutline size={13} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading conversation…</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)}

            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <IoSparklesOutline size={15} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Quick suggestions */}
            {showSuggestions && (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-semibold text-gray-400">Try asking…</p>
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="w-full flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 text-left hover:border-purple-300 hover:text-purple-700 transition-colors"
                  >
                    <span className="flex-1 leading-snug">{s}</span>
                    <IoArrowForwardCircleOutline size={20} className="shrink-0 text-purple-400" />
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 sticky bottom-0 shadow-lg">
        <div className="flex gap-2 items-end max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={`Ask about ${lessonTitle ?? 'this lesson'}…`}
            disabled={loadingHistory}
            className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || loadingHistory || !input.trim()}
            className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-40 transition-colors shrink-0"
          >
            <IoSendOutline size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  // Render **bold** markdown simply
  const renderContent = (text) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? 'bg-purple-600' : 'bg-purple-600'}`}>
        {isUser ? <IoPersonOutline size={15} className="text-white" /> : <IoSparklesOutline size={15} className="text-white" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-purple-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
      }`}>
        {renderContent(msg.content)}
      </div>
    </div>
  );
}
