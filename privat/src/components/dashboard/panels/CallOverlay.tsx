"use client";

import { useEffect, useRef } from "react";
import { useCallStore } from "@/store/call";

export function CallOverlay() {
  const {
    session,
    incomingOffer,
    localStream,
    remoteStream,
    acceptCall,
    declineCall,
    endCall,
    errors,
  } = useCallStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  type IncomingPayload = { type?: "audio" | "video"; offer?: RTCSessionDescriptionInit };
  const incomingPayload = incomingOffer?.payload as IncomingPayload | undefined;
  const incomingMode = incomingPayload?.type ?? "audio";

  if (!session && !incomingOffer) {
    return null;
  }

  const isIncoming = !!incomingOffer;
  const isConnected = session?.status === "connected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">
              {isIncoming ? "Panggilan masuk dari" : "Panggilan dengan"}
            </p>
            <h3 className="text-xl font-semibold text-white">
              {session?.peerId ?? incomingOffer?.fromId}
            </h3>
            <p className="text-xs text-slate-400">Mode: {session?.mode ?? incomingMode}</p>
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Status: {session?.status ?? "Ringing"}
          </div>
        </div>

        {errors && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
            {errors}
          </div>
        )}

        {(session?.mode === "video" || incomingMode === "video") && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-48 w-full rounded-2xl bg-black object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-48 w-full rounded-2xl bg-black object-cover"
            />
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          {isIncoming && (
            <>
              <button
                onClick={acceptCall}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
              >
                Terima
              </button>
              <button
                onClick={declineCall}
                className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-400"
              >
                Tolak
              </button>
            </>
          )}
          {!isIncoming && !isConnected && (
            <p className="rounded-full bg-white/5 px-6 py-3 text-sm text-slate-300">
              Menghubungi...
            </p>
          )}
          {(session || isConnected) && (
            <button
              onClick={endCall}
              className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-400"
            >
              Akhiri Panggilan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
