"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextArea, TextInput } from "@/components/ui/form-field";
import { reservationTerms } from "@/lib/reservations/terms";
import { formatReservationPrice, reservationPrice } from "@/lib/reservations/pricing";
import { useLanguage } from "@/lib/i18n";

type Slot = { time: string; available: boolean };

type ReservationFormProps = {
  date: string;
  durationHours: 2 | 3 | 4 | 5;
};

export function ReservationForm({
  date,
  durationHours,
}: ReservationFormProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/availability?date=${date}&durationHours=${durationHours}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(t("Available times could not be loaded."));
        const data = (await response.json()) as { slots: Slot[] };
        setSlots(data.slots);
      })
      .catch(() => setError(t("Available times could not be loaded.")))
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [date, durationHours]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!time) return setError(t("Choose an available start time."));
    if (!termsAccepted) {
      return setError(t("Please accept the terms of use before continuing."));
    }
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
        guestNotes: form.get("guestNotes") || undefined,
        serviceDate: date,
        startTime: time,
        durationHours,
        termsAccepted,
      }),
    });
    const data = (await response.json()) as {
      error?: string;
    };
    setIsSubmitting(false);
    if (!response.ok)
      return setError(data.error ?? t("Reservation could not be completed."));
    setSubmitted(true);
  }

  if (submitted)
    return (
      <div className="mt-8 border border-white/25 bg-background p-6">
        <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
          {t("Reservation received")}
        </p>
        <p className="mt-3 text-xl font-semibold">{t("Reservation request received.")}</p>
        <p className="mt-3 text-sm text-white">
          {t("Estimated price:")} {formatReservationPrice(reservationPrice(durationHours))}
        </p>
        <p className="mt-2 text-sm text-muted">
          {t("We will send confirmation details to your email.")}
        </p>
        <p className="mt-3 text-xs leading-5 text-muted">
          {t("If you cancel less than 7 days before the reservation, 50% of the reservation price is payable.")}
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
        <p className="mt-6 text-sm font-semibold text-white">{t("Choose start time")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {isLoading ? (
            <p className="text-sm text-white/70">{t("Loading times…")}</p>
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
        <FieldWrapper htmlFor="guestName" label={t("Name & Surname")}>
          <TextInput id="guestName" name="guestName" required />
        </FieldWrapper>
        <FieldWrapper htmlFor="email" label={t("Email")}>
          <TextInput id="email" name="email" required type="email" />
        </FieldWrapper>
        <FieldWrapper htmlFor="phone" label={t("Phone number")}>
          <TextInput id="phone" name="phone" required type="tel" />
        </FieldWrapper>
        <FieldWrapper htmlFor="partySize" label={t("Number of guests")}>
          <TextInput
            id="partySize"
            max="70"
            min="1"
            name="partySize"
            required
            type="number"
          />
        </FieldWrapper>
      </div>
      <FieldWrapper htmlFor="guestNotes" label={t("What should we know about your reservation? (optional)")}>
        <TextArea id="guestNotes" name="guestNotes" />
      </FieldWrapper>
      <div className="text-sm text-muted">
        <div className="flex items-start gap-3 text-sm text-foreground">
          <input
            aria-label="Условите за користење на објектот"
            checked={termsAccepted}
            className="mt-1 h-4 w-4 shrink-0 accent-accent"
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
            type="checkbox"
          />
          <div className="flex flex-wrap items-center gap-1">
            <span>{language === "mk" ? "Се согласувам со" : "I agree to"}</span>
            <details className="min-w-0">
              <summary className="cursor-pointer list-none font-semibold text-accent underline underline-offset-4 transition-colors hover:text-foreground">
                {language === "mk" ? "Условите за користење на објектот" : "Terms of use"}
              </summary>
              <div className="mt-4 space-y-3 border-l border-accent/50 pl-4 text-sm leading-6 text-muted">
                {reservationTerms.map((term) => (
                  <p key={term}>{term}</p>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-white" role="alert">
          {error}
        </p>
      ) : null}
      <Button disabled={isSubmitting || isLoading} type="submit">
        {isSubmitting ? t("Reserving…") : t("Confirm reservation")}
      </Button>
    </form>
  );
}
