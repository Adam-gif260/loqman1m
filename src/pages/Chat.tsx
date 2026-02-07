import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStreamChat } from '@/hooks/useStreamChat';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/chat/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import PreviewPanel from '@/components/chat/PreviewPanel';
import SubscriptionPopup from '@/components/chat/SubscriptionPopup';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

export interface Conversation {
  id: string;
  title: string;
  is_pinned: boolean;
  updated_at: string;
}

export default function Chat() {
  const { user, profile, refreshProfile } = useAuth();
  const { streamChat, cancel } = useStreamChat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [showPreview, setShowPreview] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('id, title, is_pinned, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (data) setConversations(data);
    };
    load();
  }, [user]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation || !user) { setMessages([]); return; }
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, role, content, image_url')
        .eq('conversation_id', activeConversation)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data.map(m => ({ ...m, role: m.role as 'user' | 'assistant' })));
        // Check if last message has code
        const last = data[data.length - 1];
        if (last?.role === 'assistant') {
          const code = extractCode(last.content);
          if (code) { setPreviewCode(code); setShowPreview(true); }
        }
      }
    };
    load();
  }, [activeConversation, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractCode = (text: string): string | null => {
    const codeBlockRegex = /```(?:html|htm|css|javascript|js|python|py|tsx?|jsx?)\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match) return match[1].trim();
    // Try generic code block
    const genericMatch = text.match(/```\n?([\s\S]*?)```/);
    if (genericMatch && genericMatch[1].trim().length > 100) return genericMatch[1].trim();
    return null;
  };

  const createConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();
    if (error || !data) return null;
    setConversations(prev => [{ id: data.id, title, is_pinned: false, updated_at: new Date().toISOString() }, ...prev]);
    return data.id;
  };

  const sendMessage = useCallback(async (input: string, imageUrl?: string) => {
    if (!user || !input.trim()) return;

    // Check credits
    if (profile && profile.credits <= 0) {
      setShowSubscriptionPopup(true);
      return;
    }

    let convId = activeConversation;
    if (!convId) {
      const title = input.length > 30 ? input.slice(0, 30) + '...' : input;
      convId = await createConversation(title);
      if (!convId) return;
      setActiveConversation(convId);
    }

    // Create user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      image_url: imageUrl,
    };
    setMessages(prev => [...prev, userMsg]);

    // Save to DB
    await supabase.from('messages').insert({
      conversation_id: convId,
      user_id: user.id,
      role: 'user',
      content: input,
      image_url: imageUrl,
    });

    // Deduct credit
    await supabase.from('profiles').update({ credits: (profile?.credits || 1) - 1, total_credits_used: (profile?.total_credits_used || 0) + 1 }).eq('user_id', user.id);
    await supabase.from('credit_transactions').insert({ user_id: user.id, amount: -1, type: 'usage', description: 'Message IA' });
    refreshProfile();

    // Prepare messages for AI
    const aiMessages: { role: string; content: any }[] = messages.concat(userMsg).map(m => {
      if (m.image_url) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.image_url } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    setIsStreaming(true);
    let fullResponse = '';
    const assistantId = crypto.randomUUID();

    await streamChat({
      messages: aiMessages,
      onDelta: (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id === assistantId) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse } : m);
          }
          return [...prev, { id: assistantId, role: 'assistant', content: fullResponse }];
        });

        // Check for code in streaming response
        const code = extractCode(fullResponse);
        if (code) {
          setPreviewCode(code);
          setShowPreview(true);
        }
      },
      onDone: async () => {
        setIsStreaming(false);
        const code = extractCode(fullResponse);
        // Save assistant message
        await supabase.from('messages').insert({
          conversation_id: convId!,
          user_id: user.id,
          role: 'assistant',
          content: fullResponse,
          has_code: !!code,
          code_content: code,
        });
        // Update conversation title if first message
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId!);
      },
      onError: (error) => {
        setIsStreaming(false);
        toast.error(error);
      },
    });
  }, [user, profile, activeConversation, messages, streamChat, refreshProfile]);

  const newChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setPreviewCode(null);
    setShowPreview(false);
    if (isMobile) {
      setSidebarOpen(false);
      setMobileView('chat');
    }
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) newChat();
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    if (isMobile) {
      setSidebarOpen(false);
      setMobileView('chat');
    }
  };

  return (
    <div className="h-[100dvh] flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={newChat}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        credits={profile?.credits ?? 0}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex-1 flex min-w-0">
        {/* Chat area */}
        <div className={`flex flex-col min-w-0 ${
          isMobile
            ? (mobileView === 'chat' ? 'flex-1' : 'hidden')
            : (showPreview ? 'flex-1' : 'flex-1')
        }`}>
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            onSend={sendMessage}
            onCancel={cancel}
            messagesEndRef={messagesEndRef}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            credits={profile?.credits ?? 0}
            onShowSubscription={() => setShowSubscriptionPopup(true)}
            isMobile={isMobile}
            mobileView={mobileView}
            onSetMobileView={setMobileView}
            showPreview={showPreview}
          />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className={`${
            isMobile
              ? (mobileView === 'preview' ? 'flex-1 flex flex-col' : 'hidden')
              : 'flex flex-col border-l border-border'
          }`}
          style={!isMobile ? { width: '50%', minWidth: 320 } : undefined}
          >
            <PreviewPanel
              code={previewCode}
              tab={previewTab}
              onTabChange={setPreviewTab}
              onClose={() => { setShowPreview(false); if (isMobile) setMobileView('chat'); }}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>

      {/* Subscription popup */}
      {showSubscriptionPopup && (
        <SubscriptionPopup onClose={() => setShowSubscriptionPopup(false)} />
      )}
    </div>
  );
}
