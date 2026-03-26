import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageCircle, MessageSquare, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PickupRequest } from "../backend.d";
import { useGetMessages, useSendMessage } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  request: PickupRequest;
  currentUserPrincipal: string;
  currentUserName: string;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagingPanel({
  open,
  onClose,
  request,
  currentUserPrincipal,
}: Props) {
  const { data: messages = [], isLoading } = useGetMessages(
    open ? request.id : null,
  );
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (msg?: string) => {
    const content = (msg ?? text).trim();
    if (!content) return;
    setText("");
    try {
      await sendMessage.mutateAsync({ requestId: request.id, text: content });
    } catch {
      // silently fail — user can retry
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec: any = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      handleSend(transcript);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] p-0 flex flex-col"
        data-ocid="messaging.sheet"
      >
        <SheetHeader className="px-4 py-4 border-b border-border bg-white">
          <SheetTitle className="flex items-center gap-2 text-brand-dark">
            <MessageSquare className="w-5 h-5 text-brand-green" />
            Chat – {request.cropType}
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted">
          {isLoading ? (
            <div
              className="flex items-center justify-center h-full text-muted-foreground text-sm"
              data-ocid="messaging.loading_state"
            >
              Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3"
              data-ocid="messaging.empty_state"
            >
              <MessageCircle className="w-10 h-10 opacity-40" />
              <p className="text-sm text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine =
                msg.fromPrincipal.toString() === currentUserPrincipal;
              return (
                <div
                  key={String(msg.id)}
                  className={`flex flex-col gap-0.5 ${
                    isMine ? "items-end" : "items-start"
                  }`}
                  data-ocid={`messaging.item.${i + 1}`}
                >
                  <span className="text-xs text-muted-foreground px-1">
                    {msg.fromName}
                  </span>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? "bg-brand-green text-white rounded-br-sm"
                        : "bg-white text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border bg-white flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 rounded-full border-border"
            data-ocid="messaging.input"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={toggleVoice}
            className={`rounded-full flex-shrink-0 ${
              isListening
                ? "border-destructive text-destructive animate-pulse"
                : "border-border text-muted-foreground"
            }`}
            data-ocid="messaging.toggle"
            title={isListening ? "Stop listening" : "Speak message"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={sendMessage.isPending || !text.trim()}
            className="rounded-full bg-brand-green text-white hover:opacity-90 flex-shrink-0"
            data-ocid="messaging.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
