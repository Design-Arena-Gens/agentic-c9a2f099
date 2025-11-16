"use client";

import { useNotificationStore } from "@/store/notification";

export function NotificationsPanel() {
  const { events, clear } = useNotificationStore();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Notifikasi Real-time</h3>
          <p className="text-sm text-slate-300">
            Semua aktivitas terbaru akan muncul di sini secara langsung.
          </p>
        </div>
        <button
          onClick={clear}
          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
        >
          Bersihkan
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {events.map((event, index) => (
          <div key={`${event.timestamp}-${index}`} className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-sky-300">{event.type}</p>
            <p className="mt-1 text-sm text-white">{event.message}</p>
            <p className="mt-2 text-[10px] text-slate-400">
              {new Date(event.timestamp).toLocaleString("id-ID")}
            </p>
          </div>
        ))}

        {events.length === 0 && (
          <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
            Notifikasi baru akan muncul saat Anda menerima pesan, undangan grup, atau panggilan.
          </p>
        )}
      </div>
    </div>
  );
}
