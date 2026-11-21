"use client";

import { useState } from "react";

function localDate(value: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function localTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Skopje",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function EditReservationButton({
  id,
  startsAt,
  endsAt,
}: {
  id: string;
  startsAt: string;
  endsAt: string;
}) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(() => localDate(startsAt));
  const [time, setTime] = useState(() => localTime(startsAt));
  const [duration, setDuration] = useState(() => {
    const hours = Math.round(
      (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 3_600_000,
    );
    return [2, 3, 4, 5].includes(hours) ? String(hours) : "2";
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/reservations/${id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceDate: date, startTime: time, durationHours: Number(duration) }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Could not edit reservation.");
        return;
      }
      setMessage("Updated — review and confirm the reservation");
      setEditing(false);
      window.location.reload();
    } catch {
      setMessage("Could not edit reservation.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="min-h-10 border border-white/25 px-4 text-xs font-bold tracking-[0.1em] text-white uppercase"
          onClick={() => setEditing(true)}
          type="button"
        >
          Edit date & time
        </button>
        {message ? <p className="text-xs text-muted">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-4 border border-white/15 bg-background p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
          Date
          <input className="mt-2 min-h-10 w-full border border-white/20 bg-surface px-2 text-sm text-white" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
          Start time
          <input className="mt-2 min-h-10 w-full border border-white/20 bg-surface px-2 text-sm text-white" type="time" step="1800" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <label className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
          Duration
          <select className="mt-2 min-h-10 w-full border border-white/20 bg-surface px-2 text-sm text-white" value={duration} onChange={(event) => setDuration(event.target.value)}>
            {[2, 3, 4, 5].map((hours) => <option key={hours} value={hours}>{hours} hours</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button className="min-h-10 bg-white px-4 text-xs font-bold tracking-[0.1em] text-background uppercase disabled:opacity-50" disabled={saving} onClick={save} type="button">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button className="min-h-10 px-2 text-xs font-bold tracking-[0.1em] text-muted uppercase" disabled={saving} onClick={() => setEditing(false)} type="button">
          Cancel
        </button>
      </div>
      {message ? <p className="mt-3 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
