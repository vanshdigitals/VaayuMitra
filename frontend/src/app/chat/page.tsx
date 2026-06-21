'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChat } from '@/lib/api';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import { Bot, User, Send, Leaf } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm VaayuMitra. I can help you understand your footprint and give you specific tips for reducing it. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const profile = JSON.parse(localStorage.getItem('vaayumitra_profile') ?? '{}');
      // Set a default city if empty so the backend validator doesn't fail
      if (!profile.city) profile.city = 'India';

      const data = await sendChat(
        profile,
        newMessages.map(m => ({ role: m.role, content: m.content })),
      );

      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, display: 'flex', flexDirection: 'column' }}>
      
      <AppHeader title="VaayuMitra AI" backHref="/dashboard" backLabel="Dashboard" />

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 160 }}>
        <div style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start', animation: 'fadeUp .3s ease both' }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isUser ? '#1C1A14' : 'rgba(90,158,209,0.12)',
                  border: `1px solid ${isUser ? 'rgba(242,239,227,0.1)' : 'rgba(90,158,209,0.2)'}`
                }}>
                  {isUser ? <User size={16} strokeWidth={1.5} color="#A09880" /> : <Bot size={16} strokeWidth={1.5} color="#5A9ED1" />}
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: 16,
                  borderTopRightRadius: isUser ? 4 : 16,
                  borderTopLeftRadius: !isUser ? 4 : 16,
                  background: isUser ? 'rgba(212,168,83,0.10)' : '#1C1A14',
                  border: `1px solid ${isUser ? 'rgba(212,168,83,0.20)' : 'rgba(242,239,227,0.08)'}`,
                  color: isUser ? '#F2EFE3' : '#A09880',
                  fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', animation: 'fadeUp .3s ease both' }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(90,158,209,0.12)', border: '1px solid rgba(90,158,209,0.2)'
              }}>
                <Bot size={16} strokeWidth={1.5} color="#5A9ED1" />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)' }}>
                <div style={{ animation: 'spinLeaf 2s linear infinite', color: '#5A9ED1' }}>
                  <Leaf size={16} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      {/* ── Input Area ─────────────────────────────────── */}
      <div style={{ 
        position: 'fixed', bottom: 60, left: 0, right: 0, 
        padding: '16px', background: 'linear-gradient(to top, #111009 80%, transparent)',
        zIndex: 50
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your footprint..."
              disabled={isLoading}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: 9999,
                background: '#1C1A14', border: '1px solid rgba(242,239,227,0.18)',
                color: '#F2EFE3', fontSize: 15, fontFamily: S, outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: 50, height: 50, borderRadius: '50%',
                background: input.trim() && !isLoading ? '#D4A853' : 'rgba(212,168,83,0.2)',
                color: '#111009', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 150ms'
              }}
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>

      <NavTabBar active="chat" />
    </div>
  );
}
