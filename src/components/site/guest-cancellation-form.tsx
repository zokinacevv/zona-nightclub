"use client";

import { useState } from "react";

export function GuestCancellationForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/reservations/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await response.json()) as { message?: string; error?: string };
    if (response.ok) setMessage(data.message ?? "Reservation cancelled.");
    else setError(data.error ?? "Could not cancel the reservation.");
    setBusy(false);
  }

  return (
    <div className="mt-8 border border-white/10 bg-surface p-6">
      <button
        className="min-h-12 bg-accent px-6 text-sm font-bold tracking-[0.12em] text-white uppercase disabled:opacity-50"
        disabled={!token || busy || Boolean(message)}
        onClick={cancel}
        type="button"
      >
        {busy ? "Cancelling…" : "Cancel reservation"}
      </button>
      {message ? <p className="mt-4 text-sm text-green-300">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
