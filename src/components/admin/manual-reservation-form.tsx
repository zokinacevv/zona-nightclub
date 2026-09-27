"use client";
import { FormEvent, useState } from "react";

export function ManualReservationForm() {
  const [message, setMessage] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = (await response.json()) as {
      error?: string;
      reservation?: { referenceCode: string };
    };
    setMessage(
      response.ok
        ? `Reservation created: ${data.reservation?.referenceCode}`
        : (data.error ?? "Could not create reservation."),
    );
  }
  return (
    <form
      className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2"
      onSubmit={submit}
    >
      {[
        ["guestName", "Guest name", "text"],
        ["email", "Email", "email"],
        ["phone", "Phone", "tel"],
        ["partySize", "Party size", "number"],
        ["serviceDate", "Date", "date"],
        ["startTime", "Start time", "time"],
      ].map(([name, label, type]) => (
        <label className="text-sm" key={name}>
          {label}
          <input
            className="mt-2 min-h-11 w-full border border-white/20 bg-surface px-3"
            min={name === "partySize" ? "1" : undefined}
            name={name}
            required
            type={type}
          />
        </label>
      ))}
      <label className="text-sm">
        Duration
        <select
          className="mt-2 min-h-11 w-full border border-white/20 bg-surface px-3"
          name="durationHours"
        >
          <option value="2">2 hours</option>
          <option value="3">3 hours</option>
          <option value="4">4 hours</option>
        </select>
      </label>
      <label className="text-sm">
        Source
        <select
          className="mt-2 min-h-11 w-full border border-white/20 bg-surface px-3"
          name="bookingSource"
        >
          <option value="PHONE">Phone</option>
          <option value="PRIVATE">Private</option>
          <option value="WALK_IN">Walk-in</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <button
        className="min-h-11 bg-accent px-5 text-sm font-bold uppercase sm:col-span-2"
        type="submit"
      >
        Create reservation
      </button>
      {message ? (
        <p className="sm:col-span-2" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
