"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSessionStore } from "@/store/session";

type LoginForm = {
  userId: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useSessionStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Login gagal");
      }
      const payload = await res.json();
      setUser(payload.user);
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
            Selamat Datang di <span className="text-sky-400">PrivaT</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Masuk menggunakan ID unik dan kata sandi Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-200">
              ID Pengguna
            </label>
            <input
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="Mis. USER-ABC123"
              {...register("userId", { required: "ID wajib diisi" })}
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-rose-400">
                {errors.userId.message}
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
              placeholder="Masukkan kata sandi"
              {...register("password", { required: "Kata sandi wajib diisi" })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk ke PrivaT"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300">
            Daftar sekarang
          </Link>
        </p>

        <div className="mt-8 rounded-xl bg-white/5 p-4 text-xs text-slate-400">
          <p>
            Akun admin tersedia dengan ID <span className="font-semibold text-white">ADMIN-001</span> dan kata sandi{" "}
            <span className="font-semibold text-white">admin123</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
