"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSessionStore } from "@/store/session";

type RegisterForm = {
  name: string;
  password: string;
  confirm: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useSessionStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    setSuccessId(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, password: data.password }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Registrasi gagal");
      }
      const payload = await res.json();
      setUser(payload.user);
      setSuccessId(payload.userId);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Buat Akun <span className="text-sky-400">PrivaT</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Dapatkan ID unik Anda dan mulai obrolan pribadi dengan aman.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-200">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="Masukkan nama Anda"
              {...register("name", { required: "Nama wajib diisi" })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-200">
              Kata Sandi
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="Minimal 6 karakter"
              {...register("password", {
                required: "Kata sandi wajib diisi",
                minLength: { value: 6, message: "Minimal 6 karakter" },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-200">
              Konfirmasi Kata Sandi
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="Tulis ulang kata sandi"
              {...register("confirm", {
                required: "Konfirmasi kata sandi wajib diisi",
                validate: (value) =>
                  value === watch("password") || "Konfirmasi harus sama",
              })}
            />
            {errors.confirm && (
              <p className="mt-1 text-sm text-rose-400">
                {errors.confirm.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {successId && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              ID Anda adalah <span className="font-semibold">{successId}</span>. Simpan dengan baik!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
