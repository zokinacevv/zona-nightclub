"use client";
import { useState } from "react";
export function CancelReservationButton({ id }: { id: string }) {
  const [message, setMessage] = useState<string>();
  async function cancel() {
    const reason = window.prompt("Cancellation reason");
    if (!reason) return;
    const response = await fetch(`/api/admin/reservations/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setMessage(response.ok ? "Cancelled" : "Could not cancel");
  }
  return (
    <span>
      <button
        className="mt-3 text-xs font-bold tracking-[0.12em] text-accent uppercase"
        onClick={cancel}
        type="button"
      >
        Cancel reservation
      </button>
      {message ? (
        <span className="ml-3 text-xs text-muted">{message}</span>
      ) : null}
    </span>
  );
}
