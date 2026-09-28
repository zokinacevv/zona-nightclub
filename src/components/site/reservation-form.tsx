"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextArea, TextInput } from "@/components/ui/form-field";

type Slot = { time: string; available: boolean };

type ReservationFormProps = {
  date: string;
  durationHours: 2 | 3 | 4;
  onDurationChange: (duration: 2 | 3 | 4) => void;
};

export function ReservationForm({
  date,
  durationHours,
  onDurationChange,
}: ReservationFormProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/availability?date=${date}&durationHours=${durationHours}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load times.");
        const data = (await response.json()) as { slots: Slot[] };
        setSlots(data.slots);
      })
      .catch(() => setError("Available times could not be loaded."))
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [date, durationHours]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!time) return setError("Choose an available start time.");
    setIsSubmitting(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: form.get("guestName"),
        email: form.get("email"),
        phone: form.get("phone"),
        partySize: form.get("partySize"),
        guestNotes: form.get("guestNotes"),
        serviceDate: date,
        startTime: time,
        durationHours,
      }),
    });
    const data = (await response.json()) as {
      error?: string;
    };
    setIsSubmitting(false);
    if (!response.ok)
      return setError(data.error ?? "Reservation could not be completed.");
    setSubmitted(true);
  }

  if (submitted)
    return (
      <div className="mt-8 border border-white/25 bg-background p-6">
        <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
          Reservation received
        </p>
        <p className="mt-3 text-xl font-semibold">Reservation request received.</p>
        <p className="mt-2 text-sm text-muted">
          We will send confirmation details to your email.
        </p>
      </div>
    );

  return (
    <form
      className="mt-8 space-y-6 border-t border-white/25 pt-8"
      onSubmit={submit}
    >
      <div>
        <p className="text-sm text-white">
          {date}
        </p>
        <div className="mt-5">
          <p className="text-sm font-semibold text-white">Duration</p>
          <div className="mt-3 flex gap-2">
            {([2, 3, 4] as const).map((duration) => (
              <button
                className={`min-h-10 border px-4 text-sm transition-colors ${duration === durationHours ? "border-accent bg-accent text-white" : "border-white/20 text-muted hover:border-white/50 hover:text-foreground"}`}
                key={duration}
                onClick={() => onDurationChange(duration)}
                type="button"
              >
                {duration}h
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm font-semibold text-white">Choose start time</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {isLoading ? (
            <p className="text-sm text-white/70">Loading times…</p>
          ) : (
            slots.map((slot) => (
              <button
                className={`min-h-11 border px-4 text-sm ${time === slot.time ? "border-white bg-white text-background" : slot.available ? "border-white/25 text-white hover:border-white" : "cursor-not-allowed border-white/10 text-white/25"}`}
                disabled={!slot.available}
                key={slot.time}
                onClick={() => setTime(slot.time)}
                type="button"
              >
                {slot.time}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper htmlFor="guestName" label="Name">
          <TextInput id="guestName" name="guestName" required />
        </FieldWrapper>
        <FieldWrapper htmlFor="email" label="Email">
          <TextInput id="email" name="email" required type="email" />
        </FieldWrapper>
        <FieldWrapper htmlFor="phone" label="Phone number">
          <TextInput id="phone" name="phone" required type="tel" />
        </FieldWrapper>
        <FieldWrapper htmlFor="partySize" label="Party size">
          <TextInput
            id="partySize"
            max="250"
            min="1"
            name="partySize"
            required
            type="number"
          />
        </FieldWrapper>
      </div>
      <FieldWrapper htmlFor="guestNotes" label="Notes">
        <TextArea id="guestNotes" name="guestNotes" />
      </FieldWrapper>
      {error ? (
        <p className="text-sm text-white" role="alert">
          {error}
        </p>
      ) : null}
      <Button disabled={isSubmitting || isLoading} type="submit">
        {isSubmitting ? "Reserving…" : "Confirm reservation"}
      </Button>
    </form>
  );
}
