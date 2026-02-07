import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Menu, Mic, Plus, Image, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import logo from '@/assets/logo.png';
import type { Message } from '@/pages/Chat';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  onSend: (input: string, imageUrl?: string) => void;
  onCancel: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  credits: number;
  onShowSubscription: () => void;
  isMobile: boolean;
  mobileView: 'chat' | 'preview';
  onSetMobileView: (view: 'chat' | 'preview') => void;
  showPreview: boolean;
}

export default function ChatArea({
  messages, isStreaming, onSend, onCancel, messagesEndRef,
  sidebarOpen, onToggleSidebar, credits, onShowSubscription,
  isMobile, mobileView, onSetMobileView, showPreview
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Highlight code blocks after render
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && !pendingImage) return;
    if (credits <= 0) { onShowSubscription(); return; }
    onSend(input.trim(), pendingImage || undefined);
    setInput('');
    setPendingImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const noCredits = credits <= 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <button onClick={onToggleSidebar} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <Menu size={18} className="text-muted-foreground" />
            </button>
          )}
        </div>
        <div />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img src={logo} alt="NexCode" className="w-14 h-14 mb-4 animate-heartbeat" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">Comment puis-je vous aider ?</h3>
            <p className="text-sm text-muted-foreground max-w-md">Décrivez votre projet ou posez une question. Je génère du code parfait en un seul coup.</p>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <img src={logo} alt="" className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  {msg.image_url && (
                    <img src={msg.image_url} alt="" className="max-w-xs rounded-lg mb-2 border border-border" />
                  )}
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/15 text-foreground'
                      : 'text-foreground'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-[hsl(250,20%,8%)] [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:text-xs [&_pre]:my-3 [&_p]:my-1.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <img src={logo} alt="" className="w-4 h-4 animate-heartbeat" />
              </div>
              <div className="flex items-center gap-1.5 py-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Pending image preview */}
      {pendingImage && (
        <div className="px-4 pb-2">
          <div className="inline-flex items-center gap-2 bg-muted rounded-lg p-2 max-w-3xl mx-auto">
            <img src={pendingImage} alt="" className="h-16 rounded" />
            <button onClick={() => setPendingImage(null)} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
          </div>
        </div>
      )}

      {/* Mobile bottom tabs */}
      {isMobile && showPreview && (
        <div className="flex border-t border-border flex-shrink-0">
          <button
            onClick={() => onSetMobileView('chat')}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              mobileView === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onSetMobileView('preview')}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              mobileView === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-secondary rounded-xl border border-border focus-within:border-primary/50 transition-colors p-2">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Ajouter une image"
            >
              <Plus size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez votre projet..."
              rows={1}
              className="flex-1 bg-transparent text-foreground text-sm resize-none outline-none placeholder:text-muted-foreground min-h-[36px] max-h-[200px] py-2"
              disabled={isStreaming}
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 transition-colors flex-shrink-0 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
              title="Micro"
            >
              <Mic size={18} />
            </button>
            <button
              onClick={isStreaming ? onCancel : handleSend}
              disabled={!isStreaming && !input.trim() && !pendingImage}
              className="p-2 bg-gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 flex-shrink-0"
            >
              {noCredits && !isStreaming ? <Lock size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
