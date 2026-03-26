import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, User, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { backendInterface as FullBackend } from "../backend.d";
import type { PickupRequest } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface CallManagerProps {
  open: boolean;
  onClose: () => void;
  request: PickupRequest;
  currentUserPrincipal: string;
  isInitiator: boolean;
  callType: "audio" | "video";
}

const STUN = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function CallManager({
  open,
  onClose,
  request,
  isInitiator,
  callType,
}: CallManagerProps) {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;
  const [status, setStatus] = useState<
    "calling" | "connecting" | "connected" | "ended"
  >("calling");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const afterIdRef = useRef<bigint>(0n);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false);
  const callTypeRef = useRef(callType);
  const isInitiatorRef = useRef(isInitiator);
  const requestIdRef = useRef(request.id);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const hangUp = async () => {
    if (actor && !endedRef.current) {
      try {
        await actor.sendCallSignal(requestIdRef.current, "end", "{}");
      } catch {}
    }
    endedRef.current = true;
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) t.stop();
    }
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    setStatus("ended");
    setTimeout(() => onCloseRef.current(), 1200);
  };

  useEffect(() => {
    if (!open || !actor) return;
    endedRef.current = false;
    const requestId = requestIdRef.current;
    const isInit = isInitiatorRef.current;
    const isVideo = callTypeRef.current === "video";

    const doCleanup = () => {
      endedRef.current = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (localStreamRef.current) {
        for (const t of localStreamRef.current.getTracks()) t.stop();
      }
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current = null;
    };

    const start = async () => {
      const constraints = { audio: true, video: isVideo };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        setStatus("ended");
        setTimeout(() => onCloseRef.current(), 1500);
        return;
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(STUN);
      pcRef.current = pc;

      for (const t of stream.getTracks()) pc.addTrack(t, stream);

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setStatus("connected");
        }
      };

      pc.onicecandidate = async (e) => {
        if (e.candidate && actor && !endedRef.current) {
          try {
            await actor.sendCallSignal(
              requestId,
              "ice-candidate",
              JSON.stringify(e.candidate.toJSON()),
            );
          } catch {}
        }
      };

      if (isInit) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await actor.sendCallSignal(requestId, "offer", JSON.stringify(offer));
        setStatus("connecting");
      }

      pollingRef.current = setInterval(async () => {
        if (endedRef.current || !actor) return;
        try {
          const signals = await actor.getCallSignals(
            requestId,
            afterIdRef.current,
          );
          for (const sig of signals) {
            if (sig.id > afterIdRef.current) afterIdRef.current = sig.id;
            if (sig.signalType === "offer" && !isInit) {
              const offer = JSON.parse(
                sig.payload,
              ) as RTCSessionDescriptionInit;
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await actor.sendCallSignal(
                requestId,
                "answer",
                JSON.stringify(answer),
              );
              setStatus("connecting");
            } else if (sig.signalType === "answer" && isInit) {
              const answer = JSON.parse(
                sig.payload,
              ) as RTCSessionDescriptionInit;
              if (pc.signalingState !== "stable") {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(answer),
                );
              }
            } else if (sig.signalType === "ice-candidate") {
              try {
                const candidate = new RTCIceCandidate(JSON.parse(sig.payload));
                await pc.addIceCandidate(candidate);
              } catch {}
            } else if (sig.signalType === "end") {
              doCleanup();
              setStatus("ended");
              setTimeout(() => onCloseRef.current(), 1200);
            }
          }
        } catch {}
      }, 1500);
    };

    start();
    return doCleanup;
  }, [open, actor]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getAudioTracks()) {
        t.enabled = !t.enabled;
      }
    }
    setMuted((m) => !m);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getVideoTracks()) {
        t.enabled = !t.enabled;
      }
    }
    setVideoOff((v) => !v);
  };

  if (!open) return null;

  const statusLabel = {
    calling: "Calling...",
    connecting: "Connecting...",
    connected: "Connected",
    ended: "Call Ended",
  }[status];

  const otherName = isInitiator
    ? (request.farmerName ?? "Farmer")
    : (request.transporterName ?? "Transporter");

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-between py-8"
      data-ocid="call.modal"
    >
      <div className="flex-1 w-full flex items-center justify-center relative">
        {callType === "video" ? (
          // biome-ignore lint/a11y/useMediaCaption: live WebRTC call stream, captions not applicable
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full max-h-[60vh] object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-brand-green/20 border-4 border-brand-green flex items-center justify-center">
              <User className="w-14 h-14 text-brand-green" />
            </div>
            <p className="text-white text-2xl font-bold">{otherName}</p>
          </div>
        )}

        {callType === "video" && (
          // biome-ignore lint/a11y/useMediaCaption: local camera preview, no captions needed
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-28 h-20 rounded-xl object-cover border-2 border-white/30"
          />
        )}
      </div>

      <div className="text-center mb-6">
        <p className="text-white/60 text-sm">{otherName}</p>
        <p
          className={`text-lg font-semibold mt-1 ${
            status === "connected" ? "text-brand-green" : "text-white/80"
          }`}
        >
          {statusLabel}
        </p>
        <p className="text-white/40 text-xs mt-1">Best on Chrome or Edge</p>
      </div>

      <div className="flex items-center gap-5">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full border-2 ${
            muted
              ? "border-red-400 bg-red-400/20 text-red-400"
              : "border-white/30 bg-white/10 text-white hover:bg-white/20"
          }`}
          data-ocid="call.toggle"
        >
          {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {callType === "video" && (
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full border-2 ${
              videoOff
                ? "border-red-400 bg-red-400/20 text-red-400"
                : "border-white/30 bg-white/10 text-white hover:bg-white/20"
            }`}
            data-ocid="call.secondary_button"
          >
            {videoOff ? (
              <VideoOff className="w-6 h-6" />
            ) : (
              <Video className="w-6 h-6" />
            )}
          </Button>
        )}

        <Button
          size="icon"
          onClick={hangUp}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
          data-ocid="call.delete_button"
        >
          <PhoneOff className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
}
