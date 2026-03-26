import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Mic, Send, Volume2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SYSTEM_PREFIX =
  "You are a helpful agricultural assistant for FarmHaul Connect, helping farmers and transporters in Africa. Answer concisely and practically: ";

function speakText(text: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

async function askAI(userMessage: string): Promise<string> {
  const prompt = SYSTEM_PREFIX + userMessage;
  const res = await fetch(
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
  );
  if (!res.ok) throw new Error("AI request failed");
  const text = await res.text();
  return text.trim();
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hello! I'm your FarmHaul Assistant. Ask me anything about farming, crop transport, or how to use FarmHaul Connect!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesLen = messages.length;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesLen, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askAI(trimmed);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "Sorry, I couldn't reach the AI service. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleListening = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Speech recognition not supported in this browser.");
      setTimeout(() => setVoiceError(""), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      sendMessage(transcript);
    };

    recognition.onerror = () => {
      setVoiceError("Voice input failed. Please try again.");
      setTimeout(() => setVoiceError(""), 3000);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        type="button"
        data-ocid="chatbot.open_modal_button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-green text-white shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={
          isOpen
            ? {}
            : {
                boxShadow: [
                  "0 0 0 0 oklch(0.55 0.15 145 / 0.5)",
                  "0 0 0 12px oklch(0.55 0.15 145 / 0)",
                  "0 0 0 0 oklch(0.55 0.15 145 / 0)",
                ],
              }
        }
        transition={{
          duration: 2,
          repeat: isOpen ? 0 : Number.POSITIVE_INFINITY,
        }}
        aria-label="Open FarmHaul Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="chatbot.modal"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-brand-green text-white flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  FarmHaul Assistant
                </p>
                <p className="text-xs text-white/70">
                  AI-powered • Always here to help
                </p>
              </div>
              <button
                type="button"
                data-ocid="chatbot.close_button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand-green text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.role === "bot" && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-green transition-colors"
                          aria-label="Read aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                {/* Voice error */}
                {voiceError && (
                  <div className="text-center text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    {voiceError}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input row */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-3 border-t border-border flex-shrink-0 bg-white"
            >
              <Input
                ref={inputRef}
                data-ocid="chatbot.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a farming question..."
                className="flex-1 text-sm h-9"
                disabled={isLoading}
              />
              <button
                type="button"
                data-ocid="chatbot.toggle"
                onClick={toggleListening}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white ring-2 ring-red-400 ring-offset-1 animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                aria-label={isListening ? "Stop listening" : "Voice input"}
              >
                <Mic className="w-4 h-4" />
              </button>
              <Button
                type="submit"
                data-ocid="chatbot.submit_button"
                size="icon"
                className="w-9 h-9 bg-brand-green hover:bg-brand-green/90 flex-shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
