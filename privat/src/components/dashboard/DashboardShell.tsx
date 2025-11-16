"use client";

import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/store/session";
import { useNotificationStore } from "@/store/notification";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/types";
import { ChatPanel } from "./panels/ChatPanel";
import { FriendsPanel } from "./panels/FriendsPanel";
import { GroupsPanel } from "./panels/GroupsPanel";
import { ProfilePanel } from "./panels/ProfilePanel";
import { AdminPanel } from "./panels/AdminPanel";
import { NotificationsPanel } from "./panels/NotificationsPanel";
import { CallOverlay } from "./panels/CallOverlay";

type DashboardShellProps = {
  initialUser: PublicUser;
};

type TabKey = "dashboard" | "chat" | "friends" | "groups" | "profile" | "admin" | "notifications";

export function DashboardShell({ initialUser }: DashboardShellProps) {
  const router = useRouter();
  const { user, setUser, logout } = useSessionStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
  }));
  const { events } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  useEffect(() => {
    if (!user) {
      setUser(initialUser);
    }
  }, [initialUser, user, setUser]);

  const navItems = useMemo(
    () =>
      [
        { key: "dashboard", label: "Dashboard" },
        { key: "chat", label: "Chat" },
        { key: "friends", label: "Teman" },
        { key: "groups", label: "Grup" },
        { key: "profile", label: "Profil" },
        { key: "notifications", label: `Notifikasi (${events.length})` },
        ...(user?.role === "admin" ? [{ key: "admin", label: "Admin Panel" }] : []),
      ] as { key: TabKey; label: string }[],
    [events.length, user?.role]
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPanel />;
      case "friends":
        return <FriendsPanel />;
      case "groups":
        return <GroupsPanel />;
      case "profile":
        return <ProfilePanel />;
      case "admin":
        return <AdminPanel />;
      case "notifications":
        return <NotificationsPanel />;
      default:
        return (
          <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-inner">
            <h2 className="text-2xl font-semibold text-white">Halo, {user?.name ?? "Pengguna"} 👋</h2>
            <p className="mt-3 text-sm text-slate-300">
              Selamat datang di <span className="font-semibold text-sky-400">PrivaT</span>. Aplikasi chat pribadi dengan fitur
              lengkap untuk komunikasi yang aman dan nyaman.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DashboardHighlight title="ID Unik Anda" value={user?.id ?? "-"} />
              <DashboardHighlight title="Total Teman" value={(user?.friends.length ?? 0).toString()} />
              <DashboardHighlight title="Status" value={user?.status ?? "-"} />
              <DashboardHighlight title="Mode Privasi" value={user?.privacy ?? "-"} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 md:flex-row md:gap-6">
        <aside className="mb-6 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:sticky md:top-6 md:mb-0 md:h-[calc(100vh-3rem)] md:w-72 md:flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-xl font-semibold text-sky-300">
              {user?.name?.[0]?.toUpperCase() ?? "P"}
            </div>
            <div>
              <p className="text-sm text-slate-300">Masuk sebagai</p>
              <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.id}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === item.key
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
          >
            Keluar
          </button>
        </aside>

        <main className="flex-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl md:p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      <CallOverlay />
    </div>
  );
}

function DashboardHighlight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
