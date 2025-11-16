"use client";

import { useEffect, useState } from "react";

type Group = {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  members: string[];
};

export function GroupsPanel() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/group/list");
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal memuat grup");
      }
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/group/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal membuat grup");
      }
      const data = await res.json();
      setFeedback(`Grup berhasil dibuat dengan ID ${data.group.id}`);
      setGroupName("");
      loadGroups();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleJoin = async () => {
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/group/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal bergabung ke grup");
      }
      const data = await res.json();
      setFeedback(`Bergabung ke grup ${data.group.name}`);
      setGroupId("");
      loadGroups();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Grup Saya</h3>
        <p className="mt-1 text-sm text-slate-300">
          Kelola grup yang Anda ikuti. Bagikan ID grup untuk mengundang teman.
        </p>

        {loading && <p className="mt-6 text-sm text-slate-300">Memuat daftar grup...</p>}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl bg-white/5 p-4">
              <h4 className="text-sm font-semibold text-white">{group.name}</h4>
              <p className="text-xs text-slate-400">ID Grup: {group.id}</p>
              <p className="mt-2 text-xs text-slate-300">
                Anggota: {group.members.length} • Dibuat {new Date(group.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}

          {!loading && groups.length === 0 && (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
              Anda belum tergabung dalam grup mana pun. Buat grup atau masukkan ID grup yang dibagikan oleh teman.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Buat Grup Baru</h3>
          <p className="mt-1 text-sm text-slate-300">Berikan nama grup yang menarik untuk komunitas Anda.</p>
          <input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Nama grup"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
          />
          <button
            onClick={handleCreate}
            className="mt-3 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-400"
          >
            Buat Grup
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Gabung Grup</h3>
          <p className="mt-1 text-sm text-slate-300">Masukkan ID grup untuk bergabung bersama teman.</p>
          <input
            value={groupId}
            onChange={(event) => setGroupId(event.target.value.toUpperCase())}
            placeholder="Contoh: GRP-ABCDE"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
          />
          <button
            onClick={handleJoin}
            className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            Gabung Sekarang
          </button>
        </div>

        {feedback && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
