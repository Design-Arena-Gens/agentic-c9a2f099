/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/store/session";
import { useNotificationStore } from "@/store/notification";
import { useCallStore } from "@/store/call";
import type { NotificationPayload } from "@/lib/types";
import type { PublicUser } from "@/lib/types";

type LoadedMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  conversationType: "private" | "group";
  messageType: "text" | "image" | "file";
  content: string;
  fileName?: string;
  createdAt: string;
};

type ConversationTarget = {
  id: string;
  label: string;
  type: "private" | "group";
};

export function ChatPanel() {
  const sessionUser = useSessionStore((state) => state.user);
  const { events } = useNotificationStore();
  const [targets, setTargets] = useState<ConversationTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ConversationTarget | null>(null);
  const [messages, setMessages] = useState<LoadedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<{ type: "image" | "file"; name: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { startCall } = useCallStore((state) => ({
    startCall: state.startCall,
  }));

  useEffect(() => {
    const loadTargets = async () => {
      try {
        const [friendsRes, groupsRes] = await Promise.all([
          fetch("/api/friends"),
          fetch("/api/group/list"),
        ]);
        const friendsPayload = friendsRes.ok ? await friendsRes.json() : { friends: [] };
        const groupsPayload = groupsRes.ok ? await groupsRes.json() : { groups: [] };
        const friendTargets: ConversationTarget[] = (friendsPayload.friends ?? []).map(
          (friend: PublicUser) => ({
            id: friend.id,
            label: `${friend.name} (${friend.id})`,
            type: "private" as const,
          }),
        );
        const groupTargets: ConversationTarget[] = (groupsPayload.groups ?? []).map(
          (group: { id: string; name: string }) => ({
            id: group.id,
            label: `#${group.name}`,
            type: "group" as const,
          }),
        );
        setTargets([...friendTargets, ...groupTargets]);
      } catch (err) {
        console.error(err);
      }
    };
    loadTargets();
  }, []);

  const loadMessages = async (target: ConversationTarget) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/chat/history?type=${target.type}&peerId=${encodeURIComponent(target.id)}`,
      );
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal memuat percakapan");
      }
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTarget) return;
    loadMessages(selectedTarget);
  }, [selectedTarget]);

  useEffect(() => {
    if (!selectedTarget) return;
    const latestMessageEvent = events.find((event) =>
      event.type === "message" && isEventForTarget(event, selectedTarget),
    );
    if (latestMessageEvent) {
      loadMessages(selectedTarget);
    }
  }, [events, selectedTarget]);

  const onSelectTarget = (target: ConversationTarget) => {
    setSelectedTarget(target);
  };

  const onSendMessage = async () => {
    if (!selectedTarget) {
      setError("Pilih teman atau grup terlebih dahulu");
      return;
    }
    if (!message && !pendingFile) {
      setError("Tidak ada konten untuk dikirim");
      return;
    }

    const payload = {
      conversationType: selectedTarget.type,
      recipientId: selectedTarget.id,
      messageType: pendingFile ? pendingFile.type : ("text" as const),
      content: pendingFile ? pendingFile.content : message,
      fileName: pendingFile?.name,
    };

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengirim pesan");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.data]);
      setMessage("");
      setPendingFile(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const parseFile = (file: File, type: "image" | "file") => {
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({
        type,
        name: file.name,
        content: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const currentMessages = useMemo(
    () =>
      messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="md:w-72">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <h3 className="text-sm font-semibold text-white">Percakapan</h3>
          <p className="mt-1 text-xs text-slate-300">
            Pilih teman atau grup untuk mulai mengobrol.
          </p>
          <div className="mt-4 space-y-2">
            {targets.map((target) => (
              <button
                key={`${target.type}-${target.id}`}
                onClick={() => onSelectTarget(target)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                  selectedTarget?.id === target.id
                    ? "bg-sky-500 text-white"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                <span className="block font-medium">{target.label}</span>
                <span className="text-xs text-slate-400">
                  {target.type === "private" ? "Chat pribadi" : "Grup"}
                </span>
              </button>
            ))}
            {targets.length === 0 && (
              <p className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                Belum ada teman atau grup. Tambahkan teman atau gabung ke grup terlebih dahulu.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-white/10 p-4">
        {selectedTarget ? (
          <div className="flex h-[560px] flex-col">
            <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedTarget.label}
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedTarget.type === "private"
                    ? "Percakapan 1-on-1 aman"
                    : "Percakapan grup"}
                </p>
              </div>
              {selectedTarget.type === "private" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall(selectedTarget.id, "audio")}
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    🔊 Suara
                  </button>
                  <button
                    onClick={() => startCall(selectedTarget.id, "video")}
                    className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-400"
                  >
                    🎥 Video
                  </button>
                </div>
              )}
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {loading && <p className="text-sm text-slate-300">Memuat pesan...</p>}
              {currentMessages.map((item) => {
                const isSelf = item.senderId === sessionUser?.id;
                return (
                  <div key={item.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                        isSelf ? "bg-sky-500 text-white" : "bg-white/5 text-slate-100"
                      }`}
                    >
                      <p className="text-xs opacity-70">{item.senderId}</p>
                      {item.messageType === "text" && <p className="mt-1 whitespace-pre-wrap">{item.content}</p>}
                      {item.messageType === "image" && (
                        <img
                          src={item.content}
                          alt={item.fileName ?? "Gambar"}
                          className="mt-2 rounded-xl"
                        />
                      )}
                      {item.messageType === "file" && (
                        <a
                          href={item.content}
                          download={item.fileName}
                          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                        >
                          📄 {item.fileName ?? "Dokumen"}
                        </a>
                      )}
                      <p className="mt-2 text-[10px] uppercase tracking-wide opacity-50">
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                {error}
              </div>
            )}

            {pendingFile && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200">
                <span>
                  Lampiran siap dikirim: <strong>{pendingFile.name}</strong>
                </span>
                <button
                  onClick={() => setPendingFile(null)}
                  className="text-rose-300 hover:text-rose-200"
                >
                  Batalkan
                </button>
              </div>
            )}

            <footer className="mt-4 rounded-2xl bg-white/5 p-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tulis pesan Anda..."
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/20">
                  Kirim Gambar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) parseFile(file, "image");
                    }}
                  />
                </label>
                <label className="cursor-pointer rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/20">
                  Kirim Dokumen
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) parseFile(file, "file");
                    }}
                  />
                </label>
                <button
                  onClick={onSendMessage}
                  className="ml-auto rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
                >
                  Kirim Pesan
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex h-[560px] flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold text-white">Mulai Obrolan</h3>
            <p className="mt-2 text-sm text-slate-300">
              Pilih teman atau grup di sebelah kiri untuk melihat riwayat percakapan dan mengirim pesan baru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function isEventForTarget(event: NotificationPayload, target: ConversationTarget) {
  if (!event.data || typeof event.data !== "object") return false;
  const payload = event.data as { message?: LoadedMessage };
  if (!payload.message) return false;
  if (target.type === "private") {
    return (
      payload.message.conversationType === "private" &&
      (payload.message.senderId === target.id ||
        payload.message.recipientId === target.id)
    );
  }
  return (
    payload.message.conversationType === "group" &&
    payload.message.recipientId === target.id
  );
}
