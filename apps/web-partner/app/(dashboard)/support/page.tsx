"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Search, Headset, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../../_components/layout/page-header";
import { Button } from "../../_components/ui/button";
import { Input } from "../../_components/ui/input";

interface Message {
  id: string;
  sender: "partner" | "admin";
  text: string;
  createdAt: string;
}

const initialMessages: Message[] = [
  { 
    id: "m1", 
    sender: "admin", 
    text: "Assalomu alaykum! Safaar yordam markaziga xush kelibsiz. Sizga qanday yordam bera olaman?", 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
  }
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessageText, setNewMessageText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "partner",
      text: newMessageText,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");
    
    // Simulate Admin reply
    setTimeout(() => {
      const adminReply: Message = {
        id: `m-${Date.now() + 1}`,
        sender: "admin",
        text: "Xabaringizni qabul qildik! Mutaxassislarimiz tez orada javob qaytarishadi.",
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, adminReply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full h-[calc(100vh-120px)] overflow-hidden">
      <PageHeader
        title="Yordam markazi"
        description="Safaar ma'muriyati bilan bevosita bog'lanish. Barcha savollaringizni shu yerda yozishingiz mumkin."
      />

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm mb-6 relative">
        
        {/* Chat Header (Admin Style) */}
        <div className="flex flex-col gap-1 border-b border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Headset className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Safaar Ma'muriyati</h3>
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Online
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Texnik yordam va savollar uchun</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8f9fa] custom-scrollbar"
        >
          <div className="flex flex-col gap-6">
            <div className="text-center text-xs text-[var(--muted-foreground)] mt-2 mb-4">
              Bugun
            </div>
            {messages.map(msg => {
              const isPartner = msg.sender === "partner";
              return (
                <div key={msg.id} className={`flex max-w-[85%] flex-col md:max-w-[70%] ${isPartner ? 'self-end' : 'self-start'}`}>
                  <div className={`mb-1 flex items-center gap-2 px-1 ${isPartner ? 'justify-end' : 'justify-start'}`}>
                    {!isPartner && (
                      <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                        Safaar Admin
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-[var(--muted-foreground)] opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isPartner && (
                      <span className="text-[11px] font-bold text-brand-600">
                        Siz
                      </span>
                    )}
                  </div>
                  <div 
                    className={`rounded-2xl p-3.5 text-[15px] leading-relaxed md:p-4 shadow-sm ${
                      isPartner 
                        ? 'rounded-tr-sm bg-brand-600 text-white' 
                        : 'rounded-tl-sm border border-[var(--border)] bg-white text-[var(--text-primary)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-[var(--border)] bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Xabar yozing..."
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-[var(--surface-muted)] pl-6 pr-14 text-sm focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newMessageText.trim()} 
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full p-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="h-5 w-5 ml-1" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
