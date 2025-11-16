import { create } from 'zustand';
import type { PublicSignal } from '@/lib/types';

type CallMode = 'audio' | 'video';

type CallSession = {
  peerId: string;
  mode: CallMode;
  status: 'idle' | 'calling' | 'ringing' | 'connected';
};

type CallState = {
  session: CallSession | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingOffer: PublicSignal | null;
  errors: string | null;
  startCall: (peerId: string, mode: CallMode) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  handleSignal: (signal: PublicSignal) => Promise<void>;
};

let peerConnection: RTCPeerConnection | null = null;
let pollingTimer: ReturnType<typeof setInterval> | null = null;

async function sendSignal(toId: string, kind: PublicSignal['kind'], payload: unknown) {
  await fetch('/api/call/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toId, kind, payload }),
  });
}

async function setupConnection(
  peerId: string,
  mode: CallMode,
  onRemoteStream: (stream: MediaStream) => void,
  onError: (error: string) => void,
) {
  const configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.ontrack = (event) => {
    onRemoteStream(event.streams[0]);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal(peerId, 'candidate', event.candidate);
    }
  };

  try {
    const constraints = mode === 'video'
      ? { audio: true, video: true }
      : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => {
      peerConnection?.addTrack(track, stream);
    });
    return stream;
  } catch (error) {
    onError('Tidak dapat mengakses mikrofon/kamera');
    throw error;
  }
}

export const useCallStore = create<CallState>((set, get) => ({
  session: null,
  localStream: null,
  remoteStream: null,
  incomingOffer: null,
  errors: null,
  async startCall(peerId, mode) {
    try {
      const localStream = await setupConnection(
        peerId,
        mode,
        (stream) => set({ remoteStream: stream }),
        (error) => set({ errors: error }),
      );

      peerConnection!.onconnectionstatechange = () => {
        if (peerConnection?.connectionState === 'connected') {
          set((state) => ({
            session: state.session ? { ...state.session, status: 'connected' } : null,
          }));
        }
      };

      const offer = await peerConnection!.createOffer();
      await peerConnection!.setLocalDescription(offer);
      await sendSignal(peerId, 'offer', { offer, type: mode });

      set({
        session: { peerId, mode, status: 'calling' },
        localStream,
        errors: null,
      });
    } catch (error) {
      console.error(error);
      set({ errors: 'Gagal memulai panggilan' });
    }
  },
  async acceptCall() {
    const { incomingOffer } = get();
    if (!incomingOffer) return;
    const peerId = incomingOffer.fromId;
    try {
      const payload = incomingOffer.payload as { offer: RTCSessionDescriptionInit; type?: CallMode };
      const localStream = await setupConnection(
        peerId,
        payload?.type === 'video' ? 'video' : 'audio',
        (stream) => set({ remoteStream: stream }),
        (error) => set({ errors: error }),
      );

      await peerConnection!.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await peerConnection!.createAnswer();
      await peerConnection!.setLocalDescription(answer);
      await sendSignal(peerId, 'answer', answer);

      set({
        session: { peerId, mode: payload?.type ?? 'audio', status: 'connected' },
        localStream,
        incomingOffer: null,
        errors: null,
      });
    } catch (error) {
      console.error(error);
      set({ errors: 'Gagal menerima panggilan' });
    }
  },
  declineCall() {
    const { incomingOffer } = get();
    if (incomingOffer) {
      sendSignal(incomingOffer.fromId, 'hangup', {});
    }
    set({ incomingOffer: null, errors: null, session: null });
  },
  endCall() {
    const session = get().session;
    if (session) {
      sendSignal(session.peerId, 'hangup', {});
    }
    peerConnection?.close();
    peerConnection = null;
    get().localStream?.getTracks().forEach((track) => track.stop());
    get().remoteStream?.getTracks().forEach((track) => track.stop());
    set({
      session: null,
      localStream: null,
      remoteStream: null,
      incomingOffer: null,
      errors: null,
    });
  },
  async handleSignal(signal) {
    switch (signal.kind) {
      case 'offer': {
        const payload = signal.payload as { offer: RTCSessionDescriptionInit; type?: CallMode };
        set({
          incomingOffer: signal,
          session: { peerId: signal.fromId, mode: payload?.type ?? 'audio', status: 'ringing' },
        });
        break;
      }
      case 'answer': {
        if (!peerConnection) break;
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit),
        );
        set((state) => ({
          session: state.session ? { ...state.session, status: 'connected' } : null,
        }));
        break;
      }
      case 'candidate': {
        if (!peerConnection) break;
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(signal.payload as RTCIceCandidateInit),
          );
        } catch (error) {
          console.error('Gagal menambah kandidat ICE', error);
        }
        break;
      }
      case 'hangup': {
        get().endCall();
        break;
      }
      default:
        break;
    }
  },
}));

export function startSignalPolling() {
  if (pollingTimer) return;
  const poll = async () => {
    try {
      const res = await fetch('/api/call/pending');
      if (!res.ok) return;
      const data = await res.json();
      const { signals } = data as { signals: PublicSignal[] };
      signals.forEach((signal) => {
        useCallStore.getState().handleSignal(signal);
      });
    } catch (error) {
      console.error('Gagal polling sinyal', error);
    }
  };
  poll();
  pollingTimer = setInterval(poll, 3000);
}

export function stopSignalPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}
