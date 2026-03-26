import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function FarmerVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<any>(null);
  const isSupported = !!SpeechRecognition;
  const { t } = useLanguage();

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    setError("");
    setTranscript("");
    setAnswer("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      fetchAnswer(text);
    };

    recognition.onerror = () => {
      setError(t("ai.error"));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const fetchAnswer = async (question: string) => {
    setIsLoading(true);
    setError("");
    try {
      const prompt = `You are an agricultural assistant helping a farmer in Africa. Answer this farming question briefly and practically: ${question}`;
      const res = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
      );
      if (!res.ok) throw new Error("API error");
      const text = await res.text();
      setAnswer(text);
      speakText(text);
    } catch {
      setError(t("ai.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <Card className="max-w-xl bg-white shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-brand-dark">{t("ai.title")}</CardTitle>
          <CardDescription>{t("ai.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            data-ocid="ai_assistant.error_state"
          >
            <MicOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">{t("ai.no_support")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="max-w-xl bg-white shadow-card rounded-2xl"
      data-ocid="ai_assistant.card"
    >
      <CardHeader>
        <CardTitle className="text-brand-dark flex items-center gap-2">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-brand-green/10">
            <Mic className="w-4 h-4 text-brand-green" />
          </span>
          {t("ai.title")}
        </CardTitle>
        <CardDescription>{t("ai.desc")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mic Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            data-ocid="ai_assistant.toggle"
            className={[
              "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-green/40 disabled:opacity-50",
              isListening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                : "bg-brand-green text-white shadow-lg shadow-brand-green/30 hover:scale-105",
            ].join(" ")}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-60" />
            )}
            {isListening ? (
              <MicOff className="w-9 h-9 relative z-10" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            {isListening ? t("ai.listening") : t("ai.tap")}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div
            className="p-4 bg-muted rounded-xl"
            data-ocid="ai_assistant.panel"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {t("ai.question")}
            </p>
            <p className="text-sm text-foreground/70 italic">{transcript}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div
            className="flex items-center gap-3 p-4 bg-muted rounded-xl"
            data-ocid="ai_assistant.loading_state"
          >
            <Loader2 className="w-5 h-5 text-brand-green animate-spin flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{t("ai.loading")}</p>
          </div>
        )}

        {/* Answer */}
        {answer && !isLoading && (
          <div
            className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl space-y-3"
            data-ocid="ai_assistant.success_state"
          >
            <p className="text-xs font-semibold text-brand-green uppercase tracking-wide">
              {t("ai.answer")}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{answer}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => speakText(answer)}
              className="rounded-pill border-brand-green text-brand-green hover:bg-brand-green hover:text-white gap-2"
              data-ocid="ai_assistant.secondary_button"
            >
              <Volume2 className="w-4 h-4" /> {t("ai.speak")}
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
            data-ocid="ai_assistant.error_state"
          >
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
