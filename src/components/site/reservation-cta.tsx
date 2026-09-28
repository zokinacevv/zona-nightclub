"use client";

import { useState } from "react";
import { ReservationCalendar } from "@/components/site/reservation-calendar";
import { ReservationForm } from "@/components/site/reservation-form";

export function ReservationCta() {
  const [durationHours, setDurationHours] = useState<2 | 3 | 4>(2);
  const [date, setDate] = useState<string>();
  return (
    <section
      id="reservations"
      className="scroll-mt-20 border-b border-white/10 bg-background px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-10 bg-accent" />
              Reservations
            </p>
            <h2 className="mt-4 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-foreground uppercase sm:text-7xl">
              Make the night
              <span className="block text-accent">yours.</span>
            </h2>
          </div>
          <div className="max-w-sm text-center lg:translate-y-5 lg:pb-1">
            <p className="text-base leading-7 text-muted">
              Choose your date, pick a time, and we’ll take care of the rest.
            </p>
          </div>
        </div>
        <div className="mt-10 max-w-2xl">
          <ReservationCalendar
            durationHours={durationHours}
            key={durationHours}
            onDateSelect={setDate}
          />
        </div>
        {date ? (
          <ReservationForm
            date={date}
            durationHours={durationHours}
            key={`${date}-${durationHours}`}
            onDurationChange={(duration) => {
              setDurationHours(duration);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
