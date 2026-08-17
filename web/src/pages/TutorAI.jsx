import { useEffect, useRef, useState } from 'react';
import {
  IoSendOutline,
  IoRefreshOutline,
  IoSparklesOutline,
  IoPersonOutline,
  IoBookOutline,
  IoCalculatorOutline,
  IoCreateOutline,
  IoBulbOutline,
  IoArrowForwardCircleOutline,
} from 'react-icons/io5';
import { tutorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MathText from '../components/MathText';

const QUICK_SUGGESTIONS = [
  { id: '1', label: 'Explain a math concept to me step by step', Icon: IoBookOutline },
  { id: '2', label: 'Help me solve a math problem with full steps', Icon: IoCalculatorOutline },
  { id: '3', label: 'Give me practice questions in Algebra or Geometry', Icon: IoCreateOutline },
  { id: '4', label: 'What are the best strategies to study math effectively?', Icon: IoBulbOutline },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? 'bg-[#4b41e1] text-white' : 'bg-[#4b41e1] text-white shadow-xs'
        }`}
      >
        {isUser ? <IoPersonOutline size={15} /> : <IoSparklesOutline size={15} />}
      </div>
      <div
        className={`max-w-[88%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-hidden ${
          isUser
            ? 'bg-[#4b41e1] text-white rounded-tr-xs'
            : 'bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] shadow-xs text-[#091426] dark:text-white rounded-tl-xs'
        }`}
      >
        <MathText text={msg.content} />
        {msg.timestamp && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-purple-200' : 'text-[#75777d]'}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TutorAI() {
  const { user } = useAuth();
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError]                 = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

  useEffect(() => {
    const welcome = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello, ${firstName}! 👋 I'm **MathMentor AI**, your personal mathematics tutor. Ask me anything about **Algebra**, **Geometry**, or **Trigonometry**!`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, [user, firstName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await tutorApi.chat({ message: msg, conversationId });
      const reply = data?.message ?? data?.response ?? data?.content ?? 'No response received.';
      const newConvId = data?.conversationId ?? data?.data?.conversationId;
      if (newConvId) setConversationId(newConvId);

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: data?.timestamp ?? new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to get a response. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = async () => {
    if (conversationId) {
      try { await tutorApi.clearConversation({ conversationId }); } catch { /* ignore */ }
    }
    setConversationId(null);
    const welcome = {
      id: 'welcome-new',
      role: 'assistant',
      content: `Chat cleared! 🗑️ Hi ${firstName}, how can I help you with your math studies today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] dark:bg-[#0b0f17]">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-[#1a2333] border-b border-[#e0e3e5] dark:border-[#2d3748] px-4 sm:px-6 py-3.5 sticky top-0 z-10 shadow-xs">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center shrink-0">
              <IoSparklesOutline size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#091426] dark:text-white leading-tight">AI Tutor</h1>
              <p className="text-xs text-[#75777d]">Ask me anything about math</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="w-9 h-9 rounded-full bg-[#f2f4f6] dark:bg-[#252f40] flex items-center justify-center text-[#75777d] dark:text-white hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <IoRefreshOutline size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area (Centered max-w-5xl for PC) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#4b41e1] flex items-center justify-center shrink-0 mt-0.5">
              <IoSparklesOutline size={15} className="text-white" />
            </div>
            <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] shadow-xs rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#4b41e1] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-[#4b41e1] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-[#4b41e1] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Quick Suggestion Rows (matching Lesson AI with 2-column PC grid) */}
        {showSuggestions && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold text-[#75777d] uppercase tracking-wider ml-1">Try asking…</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => sendMessage(item.label)}
                  className="w-full flex items-center justify-between gap-3 bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-2xl px-5 py-4 text-sm text-[#091426] dark:text-white text-left hover:border-[#4b41e1] hover:text-[#4b41e1] dark:hover:border-[#4b41e1] transition-all shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <item.Icon className="text-[#4b41e1] shrink-0" size={20} />
                    <span className="leading-snug font-medium">{item.label}</span>
                  </div>
                  <IoArrowForwardCircleOutline size={22} className="shrink-0 text-[#75777d] group-hover:text-[#4b41e1] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error Notification */}
      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 mb-2">
          <div className="text-sm text-[#ba1a1a] bg-[#ffdad6] border border-red-200 px-4 py-2.5 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* Sticky Input Bar */}
      <div className="border-t border-[#e0e3e5] dark:border-[#2d3748] bg-white dark:bg-[#1a2333] px-4 sm:px-6 py-3.5 sticky bottom-0 shadow-lg">
        <div className="flex gap-2 items-end max-w-5xl mx-auto">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#f2f4f6] dark:bg-[#252f40] border border-transparent dark:border-[#2d3748] rounded-3xl px-5 py-3 text-sm text-[#091426] dark:text-white placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] resize-none leading-relaxed transition"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full bg-[#4b41e1] hover:bg-[#3323cc] text-white flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 cursor-pointer shadow-sm"
            aria-label="Send message"
          >
            <IoSendOutline size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
