import { useState, useRef, useEffect } from 'react';
import { chatApi, ChatMessage } from '@/lib/chatApi';
import { Brain, Tractor } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatApi.ask(newMessages);
      const botMsg: ChatMessage = { role: 'assistant', content: response.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'assistant', content: 'Ops! Ocorreu um erro ao conectar com a IA.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)_/_0.8)] ring-4 ring-primary/30 hover:scale-110 hover:shadow-[0_0_30px_hsl(var(--primary))] transition-all z-50 border-2 border-primary-foreground/40 overflow-hidden group"
        title="Assistente Inteligente"
      >
        <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-colors"></div>
        <div className="relative flex items-center justify-center drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
          <Tractor size={26} className="text-primary-foreground" />
          <Brain size={18} className="absolute -top-1.5 -right-2.5 text-primary-foreground animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]" />
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-card border border-primary/50 rounded-xl shadow-[0_0_40px_hsl(var(--primary)_/_0.2)] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-[0_4px_20px_hsl(var(--primary)_/_0.5)] z-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            <h3 className="font-bold flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              <div className="relative flex items-center justify-center mr-2 mt-1">
                <Tractor size={22} />
                <Brain size={16} className="absolute -top-1.5 -right-2 text-white drop-shadow-[0_0_4px_rgba(255,255,255,1)]" />
              </div>
              Assistente Inteligente
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all z-10">
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10 text-sm">
                Olá! Sou o assistente inteligente do Deere Inspect. Como posso ajudar hoje?
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isLastMessage = idx === messages.length - 1;
              
              return (
              <div
                key={idx}
                className={`max-w-[85%] rounded-lg p-3 text-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground self-end rounded-br-none shadow-[0_0_15px_hsl(var(--primary)_/_0.4)]' 
                    : 'bg-muted text-foreground border border-primary/20 self-start rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content.split('\n').map((line, i) => {
                  const trimmedLine = line.trim();
                  const optionMatch = trimmedLine.match(/^\[OPÇÃO:\s*(.+?)\]$/i);
                  if (optionMatch && msg.role === 'assistant') {
                    return (
                      <button 
                        key={i} 
                        disabled={!isLastMessage || isLoading}
                        onClick={() => sendMessage(optionMatch[1])}
                        className={`block w-full text-center mt-2 font-medium text-xs py-2 px-3 rounded-md shadow-sm transition-all ${
                          isLastMessage && !isLoading
                            ? "bg-background border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.6)] hover:-translate-y-0.5 cursor-pointer"
                            : "bg-muted text-muted-foreground border border-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {optionMatch[1]}
                      </button>
                    );
                  }

                  return (
                    <span key={i} className="block min-h-[1.25rem]">
                      {trimmedLine.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </span>
                  );
                })}
              </div>
            )})}
            
            {isLoading && (
              <div className="bg-primary/20 text-foreground border border-primary/30 self-start rounded-bl-none max-w-[85%] rounded-lg p-3 text-sm flex gap-1 items-center">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50 font-bold hover:brightness-110 transition-all"
            >
              🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
