import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Cpu, Sparkles, User, Bot, Loader2, Minimize2, ChevronDown } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Super AI. How can I assist you today? ✨", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [isHovered, setIsHovered] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (msg) => {
    const userMessage = (typeof msg === 'string' ? msg : input).trim();
    if (userMessage === '') return;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { text: userMessage, sender: 'user', time: currentTime }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        text: data.text || "Sorry, I couldn't process that.", 
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Error fetching from chatbot backend:", error);
      setMessages(prev => [...prev, { 
        text: "Error connecting to server. Please ensure the backend is running.", 
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans">
      {/* Main Chat Window */}
      <div 
        className={`mb-4 flex flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1),0_0_20px_rgba(16,185,129,0.1)] transition-all duration-500 origin-bottom-right ${
          isOpen ? 'h-[600px] sm:h-[650px] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[85vh] opacity-100 scale-100' : 'h-0 w-0 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-5 overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white shrink-0">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-md border border-white/20">
              <Cpu size={22} className="text-white" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-400 border-[2.5px] border-emerald-600"></div>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-1.5">
                Super AI <Sparkles size={14} className="text-yellow-300" />
              </h3>
              <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                <span className="text-xs font-medium text-emerald-100">AI Assistant</span>
                <span className="w-1 h-1 rounded-full bg-emerald-200"></span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold">Online</span>
              </div>
            </div>
          </div>
          <button 
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-transparent hover:border-white/20"
            onClick={() => setIsOpen(false)}
            aria-label="Close Chat"
          >
            <Minimize2 size={16} />
          </button>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent bg-slate-50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
              style={{ animationFillMode: 'both' }}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="shrink-0 flex items-end">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm text-white ${
                    msg.sender === 'user' ? 'bg-teal-600' : 'bg-emerald-500'
                  }`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                    msg.sender === 'bot' 
                      ? 'rounded-[1.25rem] rounded-bl-sm bg-white text-slate-800 border border-slate-100' 
                      : 'rounded-[1.25rem] rounded-br-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="mt-1.5 px-1 text-[10px] font-medium text-slate-400">
                    {msg.time}
                  </span>
                </div>

              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start animate-in fade-in duration-300">
               <div className="flex gap-2 max-w-[85%]">
                <div className="shrink-0 flex items-end">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full shadow-sm text-white bg-emerald-500">
                    <Bot size={14} />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="relative px-5 py-4 rounded-[1.25rem] rounded-bl-sm bg-white text-slate-800 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <button 
              onClick={() => handleSend("What are we?")}
              className="whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300"
              disabled={isLoading}
            >
              What are we?
            </button>
            <button 
              onClick={() => handleSend("What we do?")}
              className="whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300"
              disabled={isLoading}
            >
              What we do?
            </button>
          </div>

          <div className="relative flex items-center rounded-2xl bg-slate-50 overflow-hidden border border-slate-200 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm focus-within:bg-white">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              className="flex-1 bg-transparent px-5 py-3.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <div className="pr-2">
              <button 
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                  input.trim() 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 text-slate-400'
                }`}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />}
              </button>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-medium">✨ Powered by Super AI Technology</span>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button 
        className={`group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-all duration-500 shadow-2xl ${
          isOpen 
            ? 'rounded-full bg-slate-800 hover:bg-slate-900 rotate-0 scale-90' 
            : 'rounded-[1.25rem] hover:rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-1'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={isOpen ? "Close Chat" : "Open Chat"}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 -z-10 rounded-2xl bg-emerald-500 blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-40 group-hover:opacity-70'}`}></div>
        
        <div className={`relative flex items-center justify-center transition-transform duration-500 ${isHovered && !isOpen ? 'scale-110' : 'scale-100'}`}>
          {isOpen ? (
            <ChevronDown size={32} className="text-white drop-shadow-md transition-transform duration-500" />
          ) : (
            <>
              <MessageSquare size={28} className="text-white drop-shadow-md transition-transform duration-500" />
              {/* Notification Badge */}
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-[2.5px] border-white">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default Chatbot;
