import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Halo! Saya CID•AI Assistant. Ada yang bisa saya bantu terkait penggunaan web ini?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      
      if (!response.ok) throw new Error('Chat backend failed');
      const data = await response.json();

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: data.response, 
        sender: 'bot' 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: "Maaf, sistem sedang sibuk. Silahkan coba lagi nanti.", 
        sender: 'bot' 
      }]);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.map((m) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col gap-1 max-w-[85%]">
               <div className={`flex items-center gap-2 mb-1 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-1.5 rounded-lg ${m.sender === 'user' ? 'bg-zinc-800' : 'bg-blue-600/20 text-blue-500'}`}>
                    {m.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{m.sender === 'user' ? 'User' : 'Assistant'}</span>
               </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'
              }`}>
                {m.text}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
        <div className="relative max-w-lg mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya cara pakai..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
             className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
