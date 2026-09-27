"use client";
import { FormEvent, useState } from "react";
export function AvailabilityBlockForm() {
  const [message, setMessage] = useState<string>();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = await fetch("/api/admin/availability-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    setMessage(r.ok ? "Venue block created." : "Could not create venue block.");
  }
  return (
    <form className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2" onSubmit={submit}>
      <label>
        Start
        <input
          className="mt-2 w-full border bg-surface p-2"
          name="startsAt"
          required
          type="datetime-local"
        />
      </label>
      <label>
        End
        <input
          className="mt-2 w-full border bg-surface p-2"
          name="endsAt"
          required
          type="datetime-local"
        />
      </label>
      <label className="sm:col-span-2">
        Reason
        <input
          className="mt-2 w-full border bg-surface p-2"
          name="reason"
          required
        />
      </label>
      <button className="bg-accent p-3 font-bold uppercase sm:col-span-2">
        Block venue
      </button>
      {message ? <p className="sm:col-span-2">{message}</p> : null}
    </form>
  );
}
