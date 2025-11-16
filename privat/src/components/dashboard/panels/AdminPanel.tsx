"use client";

import { useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

type AdminGroup = {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
};

export function AdminPanel() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, groupsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/groups"),
      ]);
      if (!usersRes.ok) {
        const payload = await usersRes.json();
        throw new Error(payload.error ?? "Gagal memuat user");
      }
      if (!groupsRes.ok) {
        const payload = await groupsRes.json();
        throw new Error(payload.error ?? "Gagal memuat grup");
      }
      const usersData = await usersRes.json();
      const groupsData = await groupsRes.json();
      setUsers(usersData.users ?? []);
      setGroups(groupsData.groups ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm(`Hapus user ${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal menghapus user");
      }
      loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm(`Hapus grup ${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Gagal menghapus grup");
      }
      loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Manajemen User</h3>
        <p className="text-sm text-slate-300">
          Hapus akun yang melanggar kebijakan atau menimbulkan spam.
        </p>

        {loading && <p className="mt-4 text-sm text-slate-300">Memuat data...</p>}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {user.name} {user.role === "admin" && <span className="ml-2 rounded-lg bg-sky-500/30 px-2 py-0.5 text-xs text-sky-200">Admin</span>}
                </p>
                <p className="text-xs text-slate-400">{user.id}</p>
              </div>
              {user.role !== "admin" && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Manajemen Grup</h3>
        <p className="text-sm text-slate-300">
          Tinjau grup yang dilaporkan dan hapus jika diperlukan.
        </p>

        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">{group.name}</p>
                <p className="text-xs text-slate-400">
                  ID: {group.id} • Owner: {group.ownerId} • Anggota: {group.members.length}
                </p>
              </div>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
              >
                Hapus
              </button>
            </div>
          ))}

          {groups.length === 0 && !loading && (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
              Belum ada grup yang dapat dikelola.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
