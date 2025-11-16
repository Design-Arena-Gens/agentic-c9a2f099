/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/session";
import type { PublicUser, PrivacyLevel } from "@/lib/types";

export function ProfilePanel() {
  const { user, setUser } = useSessionStore();
  const [name, setName] = useState(user?.name ?? "");
  const [status, setStatus] = useState(user?.status ?? "");
  const [privacy, setPrivacy] = useState<PrivacyLevel>(user?.privacy ?? "public");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [avatarData, setAvatarData] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <p className="text-sm text-slate-300">Memuat profil...</p>;
  }

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const profileRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          avatar: avatarData ?? avatarPreview,
        }),
      });
      if (!profileRes.ok) {
        const payload = await profileRes.json();
        throw new Error(payload.error ?? "Gagal memperbarui profil");
      }
      const profilePayload = await profileRes.json();

      const privacyRes = await fetch("/api/profile/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy }),
      });
      if (!privacyRes.ok) {
        const payload = await privacyRes.json();
        throw new Error(payload.error ?? "Gagal memperbarui privasi");
      }
      const privacyPayload = await privacyRes.json();

      const updatedUser: PublicUser = {
        ...profilePayload.user,
        privacy: privacyPayload.user.privacy,
      };
      setUser(updatedUser);
      setMessage("Profil berhasil diperbarui.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Informasi Akun</h3>
        <p className="mt-1 text-sm text-slate-300">
          Ubah nama, status, dan foto profil agar teman mudah mengenali Anda.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-sky-300">
                  {user.name[0]?.toUpperCase() ?? "P"}
                </div>
              )}
            </div>
            <label className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
              Ganti Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleAvatarChange(event.target.files?.[0])}
              />
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nama Lengkap
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </label>
            <textarea
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h3 className="text-lg font-semibold text-white">Privasi Akun</h3>
        <p className="mt-1 text-sm text-slate-300">
          Atur siapa saja yang dapat melihat status dan menghubungi Anda.
        </p>

        <div className="mt-6 space-y-3">
          <RadioOption
            label="Publik"
            description="Semua pengguna PrivaT dapat menemukan Anda dan melihat status."
            value="public"
            current={privacy}
            onSelect={setPrivacy}
          />
          <RadioOption
            label="Hanya Teman"
            description="Hanya teman yang sudah ditambahkan yang dapat melihat status dan menghubungi."
            value="friends"
            current={privacy}
            onSelect={setPrivacy}
          />
          <RadioOption
            label="Privat"
            description="Tidak ada yang dapat mencari Anda. Anda hanya dapat dihubungi oleh akun yang Anda tambahkan."
            value="private"
            current={privacy}
            onSelect={setPrivacy}
          />
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

function RadioOption({
  label,
  description,
  value,
  current,
  onSelect,
}: {
  label: string;
  description: string;
  value: PrivacyLevel;
  current: PrivacyLevel;
  onSelect: (value: PrivacyLevel) => void;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
        active
          ? "border-sky-400 bg-sky-500/20 text-white"
          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      }`}
    >
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-xs text-slate-300">{description}</p>
    </button>
  );
}
