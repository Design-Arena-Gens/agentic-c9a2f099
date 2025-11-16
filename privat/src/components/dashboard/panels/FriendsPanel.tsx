"use client";

import { useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

export function FriendsPanel() {
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendId, setFriendId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal memuat daftar teman");
      }
      const data = await res.json();
      setFriends(data.friends ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleAddFriend = async () => {
    setFeedback(null);
    setError(null);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal menambahkan teman");
      }
      setFriendId("");
      setFeedback("Teman berhasil ditambahkan.");
      loadFriends();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Daftar Teman</h3>
        <p className="mt-1 text-sm text-slate-300">Pantau status mereka dan mulai chat kapan saja.</p>

        {loading && <p className="mt-6 text-sm text-slate-300">Memuat teman...</p>}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div>
                <h4 className="text-sm font-semibold text-white">{friend.name}</h4>
                <p className="text-xs text-slate-400">{friend.id}</p>
                <p className="mt-2 text-xs text-slate-300">Status: {friend.status}</p>
              </div>
              <div className="text-xs text-emerald-300">
                {friend.privacy === "public" && "Publik"}
                {friend.privacy === "friends" && "Hanya Teman"}
                {friend.privacy === "private" && "Privat"}
              </div>
            </div>
          ))}
          {!loading && friends.length === 0 && (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
              Belum ada teman. Tambahkan teman menggunakan ID unik mereka.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Tambah Teman</h3>
        <p className="mt-1 text-sm text-slate-300">
          Minta teman membagikan ID unik mereka, lalu masukkan di form berikut.
        </p>

        <div className="mt-4 space-y-3">
          <input
            value={friendId}
            onChange={(event) => setFriendId(event.target.value.toUpperCase())}
            placeholder="Contoh: USER-ABC123"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
          />
          <button
            onClick={handleAddFriend}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-400"
          >
            Tambahkan
          </button>
        </div>

        {feedback && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
