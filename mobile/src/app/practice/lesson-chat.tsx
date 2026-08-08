import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tutorService } from '@/services/tutorService';
import { lessonService } from '@/services/lessonService';
import { Message } from '@/types/tutor';
import { useTheme } from '@/context/ThemeContext';

export default function LessonChatScreen() {
  const { lessonId, lessonTitle, topic, subtopic } = useLocalSearchParams<{
    lessonId: string;
    lessonTitle: string;
    topic: string;
    subtopic: string;
  }>();
  const router = useRouter();
  const { darkMode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const C = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    headerBg: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    aiBubbleBg: darkMode ? '#1a1a1a' : '#ffffff',
    inputBg: darkMode ? '#1a1a1a' : '#ffffff',
    inputFieldBg: darkMode ? '#2a2a2a' : '#f2f4f6',
    inputText: darkMode ? '#f0f0f0' : '#091426',
    surface: darkMode ? '#1a1a1a' : '#f2f4f6',
    placeholder: darkMode ? '#666666' : '#b0b3b8',
    iconBg: darkMode ? '#312e81' : '#e2dfff',
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  const quickSuggestions = [
    `Can you give me a practice problem for ${lessonTitle}?`,
    `What are the key formulas I need to know for this lesson?`,
    `Can you explain this with a real-world example?`,
    `What mistakes do students commonly make in this topic?`,
  ];

  // Load persisted conversation on mount
  useEffect(() => {
    loadConversationHistory();
  }, [lessonId]);

  const loadConversationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await lessonService.getLessonConversation(lessonId);

      if (data.conversationId && data.messages.length > 0) {
        // Restore persisted conversation — prepend welcome back message
        const restoredMessages: Message[] = [
          {
            id: 'welcome-back',
            role: 'assistant',
            content: `Welcome back! 👋 Continuing your conversation about **${lessonTitle}**.\n\nFeel free to pick up where you left off or ask something new.`,
            timestamp: new Date().toISOString(),
          },
          ...data.messages.map((m, i) => ({
            id: `history-${i}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
        ];
        setMessages(restoredMessages);
        setConversationId(data.conversationId);
      } else {
        // Fresh start
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hi! I'm your AI tutor for this lesson. 📚\n\nYou're studying **${lessonTitle}** — part of **${topic} › ${subtopic}**.\n\nAsk me anything about this lesson — I can explain concepts, walk through examples, give you practice problems, or help clarify anything confusing. What would you like to explore?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Silently fall back to fresh conversation
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm your AI tutor for this lesson. 📚\n\nYou're studying **${lessonTitle}** — part of **${topic} › ${subtopic}**.\n\nWhat would you like to explore?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteConversation = () => {
    if (!conversationId) return;
    Alert.alert(
      'Delete Conversation',
      'This will permanently delete your chat history for this lesson. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await lessonService.deleteLessonConversation(lessonId);
              setConversationId(undefined);
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: `Chat cleared! 🗑️ Starting fresh on **${lessonTitle}**.\n\nWhat would you like to explore?`,
                  timestamp: new Date().toISOString(),
                },
              ]);
            } catch {
              Alert.alert('Error', 'Failed to delete conversation. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Prefix very first real user message with lesson context
    const priorUserMessages = messages.filter((m) => m.role === 'user');
    const isFirstMessage = priorUserMessages.length === 0;
    const contextualMessage = isFirstMessage
      ? `I'm studying "${lessonTitle}" (${topic} - ${subtopic}). ${messageText}`
      : messageText;

    try {
      const response = await tutorService.sendMessage(contextualMessage, conversationId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const newConversationId = response.conversationId;
      setConversationId(newConversationId);

      // Persist the exchange to MongoDB
      lessonService
        .saveLessonConversationMessage(lessonId, newConversationId, messageText, response.message)
        .catch((err) => console.warn('Failed to persist lesson conversation:', err));

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        'Failed to send message. Please try again.';

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#ffffff" />
          </View>
        )}
        <View
          style={[
            styles.messageContent,
            isUser
              ? styles.userContent
              : [styles.aiContent, { backgroundColor: C.aiBubbleBg }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : [styles.aiText, { color: C.text }],
            ]}
          >
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.headerBg, borderBottomColor: C.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: C.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerIconBg, { backgroundColor: C.iconBg }]}>
            <Ionicons name="sparkles" size={18} color="#4b41e1" />
          </View>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>
              Ask AI Tutor
            </Text>
            <Text style={[styles.headerSubtitle, { color: C.textLight }]} numberOfLines={1}>
              {lessonTitle}
            </Text>
          </View>
        </View>

        {conversationId && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: darkMode ? '#2a1a1a' : '#fff1f0' }]}
            onPress={handleDeleteConversation}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Context pill */}
      <View style={[styles.contextBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="book-outline" size={14} color="#4b41e1" />
        <Text style={[styles.contextText, { color: C.textLight }]}>
          {topic} › {subtopic}
        </Text>
        {conversationId && (
          <View style={styles.savedPill}>
            <Ionicons name="cloud-done-outline" size={12} color="#10b981" />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.contentArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoadingHistory ? (
          <View style={styles.historyLoadingContainer}>
            <ActivityIndicator size="large" color="#4b41e1" />
            <Text style={[styles.historyLoadingText, { color: C.textLight }]}>
              Loading conversation...
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <View style={styles.loadingBubble}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#ffffff" />
                </View>
                <View style={[styles.loadingContent, { backgroundColor: C.aiBubbleBg }]}>
                  <ActivityIndicator size="small" color="#4b41e1" />
                  <Text style={[styles.loadingText, { color: C.textLight }]}>Thinking...</Text>
                </View>
              </View>
            )}

            {/* Quick suggestions — only on fresh conversations before any user message */}
            {messages.length === 1 && messages[0].id === 'welcome' && !isLoading && (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsTitle, { color: C.textLight }]}>
                  Try asking...
                </Text>
                {quickSuggestions.map((suggestion, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.suggestionChip,
                      { backgroundColor: C.aiBubbleBg, borderColor: C.border },
                    ]}
                    onPress={() => handleSendMessage(suggestion)}
                  >
                    <Text style={[styles.suggestionText, { color: C.text }]}>{suggestion}</Text>
                    <Ionicons name="arrow-forward-circle" size={18} color="#4b41e1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Input */}
        <View
          style={[styles.inputContainer, { backgroundColor: C.inputBg, borderTopColor: C.border }]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { backgroundColor: C.inputFieldBg, color: C.inputText }]}
              placeholder={`Ask about ${lessonTitle}...`}
              placeholderTextColor={C.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading && !isLoadingHistory}
              onFocus={() => {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
              }}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading || isLoadingHistory) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading || isLoadingHistory}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  savedText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
  historyLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  historyLoadingText: {
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userContent: {
    backgroundColor: '#4b41e1',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  aiContent: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {},
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
