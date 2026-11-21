"use client";

import { FormEvent, useMemo, useState } from "react";

const durations = [2, 3, 4, 5] as const;
const startTimes = Array.from({ length: 22 }, (_, index) => {
  const totalMinutes = 13 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function formatEndTime(date: string, time: string, duration: number) {
  const startsAt = new Date(`${date}T${time}`);
  const endsAt = new Date(startsAt.getTime() + duration * 60 * 60 * 1000);

  return endsAt.toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function AvailabilityBlockForm() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("13:00");
  const [durationHours, setDurationHours] =
    useState<(typeof durations)[number]>(2);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endTime = useMemo(
    () => (date ? formatEndTime(date, startTime, durationHours) : "Choose a date"),
    [date, durationHours, startTime],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !reason.trim()) {
      setMessage("Choose a date and enter a reason.");
      return;
    }

    setIsSubmitting(true);
    setMessage(undefined);

    const startsAt = new Date(`${date}T${startTime}`);
    const endsAt = new Date(
      startsAt.getTime() + durationHours * 60 * 60 * 1000,
    );
    const response = await fetch("/api/admin/availability-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        reason: reason.trim(),
      }),
    });

    setIsSubmitting(false);
    setMessage(
      response.ok ? "Venue block created." : "Could not create venue block.",
    );
    if (response.ok) setReason("");
  }

  return (
    <form className="mt-8 max-w-xl space-y-6" onSubmit={submit}>
      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="block-date">
          Date
        </label>
        <input
          className="mt-2 w-full border border-white/20 bg-surface p-3 text-foreground"
          id="block-date"
          onChange={(event) => setDate(event.target.value)}
          required
          type="date"
          value={date}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Start time</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {startTimes.map((time) => (
            <button
              className={`min-h-10 border px-3 text-sm transition-colors ${time === startTime ? "border-accent bg-accent text-white" : "border-white/20 text-muted hover:border-white/50 hover:text-foreground"}`}
              key={time}
              onClick={() => setStartTime(time)}
              type="button"
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Duration</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {durations.map((duration) => (
            <button
              className={`min-h-11 border text-sm font-semibold transition-colors ${duration === durationHours ? "border-accent bg-accent text-white" : "border-white/20 text-muted hover:border-white/50 hover:text-foreground"}`}
              key={duration}
              onClick={() => setDurationHours(duration)}
              type="button"
            >
              {duration}h
            </button>
          ))}
        </div>
      </div>

      <div className="border border-white/10 bg-surface p-4 text-sm text-muted">
        Block ends: <span className="font-semibold text-foreground">{endTime}</span>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="block-reason">
          Reason
        </label>
        <input
          className="mt-2 w-full border border-white/20 bg-surface p-3 text-foreground"
          id="block-reason"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Private event"
          required
          value={reason}
        />
      </div>

      <button
        className="w-full bg-accent p-3 font-bold text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Blocking…" : "Block venue"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
