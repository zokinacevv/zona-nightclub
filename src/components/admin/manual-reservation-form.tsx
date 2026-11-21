"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationCalendar } from "@/components/site/reservation-calendar";

const durations = [2, 3, 4, 5] as const;
type Slot = { time: string; available: boolean };

export function ManualReservationForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("13:00");
  const [durationHours, setDurationHours] =
    useState<(typeof durations)[number]>(2);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();

    fetch(`/api/availability?date=${date}&durationHours=${durationHours}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load times.");
        const data = (await response.json()) as { slots: Slot[] };
        setSlots(data.slots);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSlotsError("Available times could not be loaded.");
      })
      .finally(() => setIsLoadingSlots(false));

    return () => controller.abort();
  }, [date, durationHours]);

  function selectDate(nextDate: string) {
    setDate(nextDate);
    setStartTime("");
    setSlots([]);
    setSlotsError(undefined);
    setIsLoadingSlots(true);
  }

  function selectDuration(nextDuration: (typeof durations)[number]) {
    setDurationHours(nextDuration);
    setStartTime("");
    setSlots([]);
    if (date) setIsLoadingSlots(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) {
      setMessage("Choose an available date.");
      return;
    }
    if (!startTime) {
      setMessage("Choose an available start time.");
      return;
    }
    setIsSubmitting(true);
    setMessage(undefined);

    const form = new FormData(event.currentTarget);
    form.set("serviceDate", date);
    form.set("startTime", startTime);
    form.set("durationHours", String(durationHours));

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = (await response.json()) as { error?: string };
      if (response.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setMessage(data.error ?? "Could not create reservation.");
    } catch {
      setMessage("Could not connect to the admin server.");
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="text-sm">
        <p>Duration</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {durations.map((duration) => (
            <button
              className={`min-h-11 border font-semibold transition-colors ${duration === durationHours ? "border-accent bg-accent text-white" : "border-white/20 text-muted hover:border-white/50 hover:text-foreground"}`}
              key={duration}
              onClick={() => selectDuration(duration)}
              type="button"
            >
              {duration}h
            </button>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <ReservationCalendar
          durationHours={durationHours}
          onDateSelect={selectDate}
        />
      </div>

      {date ? (
      <div className="text-sm sm:col-span-2">
          <p className="font-semibold text-white">Choose start time</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isLoadingSlots ? (
              <p className="text-sm text-white/70">Loading times…</p>
            ) : (
              slots.map((slot) => (
                <button
                  className={`min-h-11 border px-4 text-sm ${startTime === slot.time ? "border-white bg-white text-background" : slot.available ? "border-white/25 text-white hover:border-white" : "cursor-not-allowed border-white/10 text-white/25"}`}
                  disabled={!slot.available}
                  key={slot.time}
                  onClick={() => setStartTime(slot.time)}
                  type="button"
                >
                  {slot.time}
                </button>
              ))
            )}
          </div>
          {slotsError ? <p className="mt-3 text-sm text-white" role="alert">{slotsError}</p> : null}
        </div>
      ) : null}

      <input name="bookingSource" type="hidden" value="ADMIN" />

      <button
        className="min-h-11 bg-accent px-5 text-sm font-bold uppercase sm:col-span-2"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating…" : "Create reservation"}
      </button>
      {message ? (
        <p className="sm:col-span-2" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
