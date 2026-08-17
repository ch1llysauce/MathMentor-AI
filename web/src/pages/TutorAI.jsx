import { useEffect, useRef, useState } from 'react';
import { IoSendOutline, IoRefreshOutline, IoSparklesOutline, IoPersonOutline, IoBookOutline, IoCalculatorOutline, IoCreateOutline, IoBulbOutline } from 'react-icons/io5';
import { tutorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MathText from '../components/MathText';

const QUICK_ACTIONS = [
  { id: '1', label: 'Explain a concept',    message: 'Can you explain a math concept to me?',                     Icon: IoBookOutline },
  { id: '2', label: 'Solve a problem',      message: 'Can you help me solve a math problem step by step?',         Icon: IoCalculatorOutline },
  { id: '3', label: 'Practice questions',   message: 'Can you give me some practice problems?',                    Icon: IoCreateOutline },
  { id: '4', label: 'Study tips',           message: 'What are some tips for studying mathematics effectively?',   Icon: IoBulbOutline },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
        }`}
      >
        {isUser ? <IoPersonOutline size={16} /> : <IoSparklesOutline size={16} />}
      </div>
      <div
        className={`max-w-[88%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-hidden ${
          isUser
            ? 'bg-purple-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'
        }`}
      >
        <MathText text={msg.content} />
      </div>
    </div>
  );
}

export default function TutorAI() {
  const { user } = useAuth();
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [conversationId, setConversationId] = useState(undefined);
  const [error, setError]                 = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const firstName = (user?.displayName ?? user?.name ?? 'there').split(' ')[0];

  // Add welcome message on mount
  useEffect(() => {
    const welcome = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${firstName}! I'm your AI math tutor. I'm here to help you understand math concepts, solve problems, and answer any questions you have about Algebra, Geometry, or Trigonometry.\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, [firstName]);

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
      // Backend returns { message, conversationId, timestamp } at root level (not wrapped in data.data)
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
    setConversationId(undefined);
    const welcome = {
      id: 'welcome-new',
      role: 'assistant',
      content: `Hi ${firstName}! I'm your AI math tutor. How can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  };

  // Only show quick actions if there's just the welcome message
  const showQuickActions = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <IoSparklesOutline size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">AI Tutor</h1>
            <p className="text-xs text-gray-400">Ask me anything about math</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          title="New conversation"
        >
          <IoRefreshOutline size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}

        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <IoSparklesOutline size={16} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Quick actions — shown only after welcome msg */}
        {showQuickActions && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-400 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => sendMessage(a.message)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 text-left flex flex-col items-center gap-2 shadow-sm hover:border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <a.Icon size={20} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-800 text-center">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 sm:mx-6 mb-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl shrink-0">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 sm:px-6 py-3 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
            placeholder="Ask me anything…"
            className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-40 transition-colors shrink-0"
            aria-label="Send message"
          >
            <IoSendOutline size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
