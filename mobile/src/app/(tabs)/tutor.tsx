import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { tutorService } from '@/services/tutorService';
import { Message, QuickAction } from '@/types/tutor';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';

export default function TutorScreen() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const T = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    headerBg: darkMode ? '#0a0a0a' : Colors.white,
    border: darkMode ? '#2e2e2e' : Colors.borderLight,
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    iconContainerBg: darkMode ? '#312e81' : '#e2dfff',
    clearBtnBg: darkMode ? '#1a1a1a' : Colors.surface,
    clearBtnIcon: darkMode ? '#f0f0f0' : '#091426',
    aiBubbleBg: darkMode ? '#1a1a1a' : Colors.white,
    inputBg: darkMode ? '#1a1a1a' : Colors.white,
    inputFieldBg: darkMode ? '#2a2a2a' : Colors.surface,
    inputText: darkMode ? '#f0f0f0' : Colors.text,
    quickCardBg: darkMode ? '#1a1a1a' : Colors.white,
    quickIconBg: darkMode ? '#312e81' : '#e2dfff',
    placeholder: darkMode ? '#666666' : '#b0b3b8',
    modalBg: darkMode ? '#18181b' : '#ffffff',
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showClearModal, setShowClearModal] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Explain a concept',
      message: 'Can you explain a math concept to me?',
      icon: 'book-outline',
    },
    {
      id: '2',
      label: 'Solve a problem',
      message: 'Can you help me solve a math problem step by step?',
      icon: 'calculator-outline',
    },
    {
      id: '3',
      label: 'Practice questions',
      message: 'Can you give me some practice problems?',
      icon: 'create-outline',
    },
    {
      id: '4',
      label: 'Study tips',
      message: 'What are some tips for studying mathematics effectively?',
      icon: 'bulb-outline',
    },
  ];

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${user?.displayName || 'there'}! 👋 I'm your AI math tutor. I'm here to help you understand math concepts, solve problems, and answer any questions you have about Algebra, Geometry, or Trigonometry.\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await tutorService.sendMessage(messageText, conversationId);

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(response.conversationId);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details 
        || error.message 
        || 'Failed to send message. Please try again.';
      
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK' }]
      );
      
      // Remove the user message if failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setShowClearModal(true);
  };

  const executeClearConversation = async () => {
    setShowClearModal(false);
    if (conversationId) {
      try {
        await tutorService.clearConversation(conversationId);
      } catch (error) {
        console.error('Error clearing conversation:', error);
      }
    }
    setMessages([]);
    setConversationId(undefined);
    
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${user?.displayName || 'there'}! 👋 I'm your AI math tutor. I'm here to help you understand math concepts, solve problems, and answer any questions you have about Algebra, Geometry, or Trigonometry.\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
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
        <View style={[
          styles.messageContent,
          isUser ? styles.userContent : [styles.aiContent, { backgroundColor: T.aiBubbleBg }]
        ]}>
          <MessageRenderer
            content={message.content}
            isUser={isUser}
            textColor={isUser ? '#ffffff' : T.text}
            fontSize={15}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header - Fixed Position */}
      <View style={[styles.header, { backgroundColor: T.headerBg, borderBottomColor: T.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconContainer, { backgroundColor: T.iconContainerBg }]}>
            <Ionicons name="sparkles" size={24} color="#4b41e1" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: T.text }]}>AI Tutor</Text>
            <Text style={[styles.headerSubtitle, { color: T.textLight }]}>Ask me anything about math</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.clearButton, { backgroundColor: T.clearBtnBg }]} onPress={handleClearConversation}>
          <Ionicons name="refresh-outline" size={24} color={T.clearBtnIcon} />
        </TouchableOpacity>
      </View>

      {/* Content Area - Takes remaining space */}
      <KeyboardAvoidingView 
        style={styles.contentArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
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
            <View style={[styles.loadingContent, { backgroundColor: T.aiBubbleBg }]}>
              <ActivityIndicator size="small" color="#4b41e1" />
              <Text style={[styles.loadingText, { color: T.textLight }]}>Thinking...</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {messages.length === 1 && !isLoading && (
          <View style={styles.quickActionsContainer}>
            <Text style={[styles.quickActionsTitle, { color: T.textLight }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, { backgroundColor: T.quickCardBg }]}
                  onPress={() => handleSendMessage(action.message)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: T.quickIconBg }]}>
                    <Ionicons name={action.icon as any} size={20} color="#4b41e1" />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: T.text }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: T.inputBg, borderTopColor: T.border }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { backgroundColor: T.inputFieldBg, color: T.inputText }]}
            placeholder='Ask me anything...'
            placeholderTextColor={T.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>

      {/* Clear Conversation Modal Confirmation */}
      <Modal visible={showClearModal} transparent animationType="fade" onRequestClose={() => setShowClearModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: T.modalBg, borderColor: T.border }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>
            <Text style={[styles.modalTitle, { color: T.text }]}>Clear Conversation?</Text>
            <Text style={[styles.modalSubtitle, { color: T.textLight }]}>
              Are you sure you want to clear your conversation history? This action cannot be undone.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ba1a1a' }]}
                onPress={executeClearConversation}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Clear Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#242424' : '#f2f4f6' }]}
                onPress={() => setShowClearModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: T.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    zIndex: 1000,
  },
  contentArea: {
    flex: 1,
    marginTop: 124,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2dfff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: Colors.text,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  quickActionsContainer: {
    marginTop: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2dfff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
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

  /* Modal Confirmation Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalBtnRow: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
