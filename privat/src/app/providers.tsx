"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";
import { useNotificationStore } from "@/store/notification";
import { startSignalPolling, stopSignalPolling } from "@/store/call";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { fetchSession, user, loading } = useSessionStore();
  const { connect, disconnect } = useNotificationStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (user) {
      connect();
      startSignalPolling();
    } else {
      disconnect();
      stopSignalPolling();
    }
  }, [user, connect, disconnect]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse text-lg font-semibold">
          Memuat PrivaT...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
