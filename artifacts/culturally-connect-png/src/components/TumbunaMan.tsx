import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { authHeaders } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TumbunaManProps {
  provinceId: string;
  provinceName: string;
}

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export function TumbunaMan({ provinceId, provinceName }: TumbunaManProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const ensureConversation = useCallback(async (): Promise<number> => {
    if (conversationId) return conversationId;
    const resp = await fetch(`${BASE_URL}/api/openai/conversations`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title: `Tumbuna Man – ${provinceName}` }),
    });
    const data = await resp.json() as { id: number };
    setConversationId(data.id);
    return data.id;
  }, [conversationId, provinceName]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Apinun! [Good day!] I am Tumbuna Man, the keeper of ancestral wisdom from all 22 provinces of Papua New Guinea.\n\nYou are now exploring **${provinceName}** — ask me about its oral histories, traditional medicines, village origins, or any cultural knowledge. Mi stap hia long helpim yu. [I am here to help you.]`
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages.length, provinceName]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending || isStreaming) return;

    setInput("");
    setIsSending(true);
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const convId = await ensureConversation();
      setIsSending(false);
      setIsStreaming(true);

      let assistantContent = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const resp = await fetch(`${BASE_URL}/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: text, provinceId }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (payload.content) {
              assistantContent += payload.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            } else if (payload.done || payload.error) {
              if (payload.error) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: payload.error! };
                  return updated;
                });
              }
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sori tumas — [Very sorry —] Tumbuna Man cannot speak right now. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  }, [input, isSending, isStreaming, ensureConversation, provinceId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#5C3D2E] to-[#2D4A1E] shadow-[0_0_25px_rgba(255,160,50,0.5)] flex items-center justify-center border-2 border-primary/50 hover:scale-110 transition-transform"
            aria-label="Open Tumbuna Man"
          >
            <span className="text-2xl select-none">🦅</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)] border border-white/10"
            style={{ background: "linear-gradient(160deg, #1a120b 0%, #0f1f0f 60%, #1a0d0d 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/30 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C3D2E] to-[#2D4A1E] border border-primary/40 flex items-center justify-center text-xl flex-shrink-0">
                🦅
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-bold text-primary text-base leading-tight">Tumbuna Man</div>
                <div className="text-xs text-muted-foreground truncate">
                  Ancestral Guide · {provinceName}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5C3D2E] to-[#2D4A1E] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      🦅
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground rounded-tr-sm border border-primary/20"
                        : "bg-white/5 text-foreground/90 rounded-tl-sm border border-white/10"
                    }`}
                  >
                    {msg.content || (
                      <span className="flex gap-1 items-center text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10 bg-black/20 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending || isStreaming}
                  placeholder="Ask Tumbuna Man…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isSending || isStreaming}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-all hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isSending || isStreaming ? (
                    <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-primary-foreground" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                Powered by ancestral knowledge · {provinceName} Cultural Vault
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
