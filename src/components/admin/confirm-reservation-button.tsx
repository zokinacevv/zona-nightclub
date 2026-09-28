"use client";

import { useState } from "react";

export function ConfirmReservationButton({ id }: { id: string }) {
  const [message, setMessage] = useState("");

  async function confirm() {
    const response = await fetch(`/api/admin/reservations/${id}/confirm`, { method: "POST" });
    setMessage(response.ok ? "Confirmed — guest notified" : "Could not confirm");
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button className="min-h-10 bg-green-700 px-4 text-xs font-bold tracking-[0.1em] text-white uppercase" onClick={confirm} type="button">
        Confirm reservation
      </button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}
