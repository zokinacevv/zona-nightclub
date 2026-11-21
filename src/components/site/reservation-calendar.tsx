"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n";

type DateAvailability = { date: string; available: boolean };

function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}`;
}

function changeMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function datesForMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: totalDays }, (_, index) => ({
    date: `${month}-${String(index + 1).padStart(2, "0")}`,
    day: index + 1,
    offset: index === 0 ? startDay : undefined,
  }));
}

type ReservationCalendarProps = {
  durationHours: 2 | 3 | 4 | 5;
  onDateSelect: (date: string) => void;
};

export function ReservationCalendar({
  durationHours,
  onDateSelect,
}: ReservationCalendarProps) {
  const { language, t } = useLanguage();
  const [firstMonth] = useState(() => currentMonth());
  const [month, setMonth] = useState(firstMonth);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/availability?month=${month}&durationHours=${durationHours}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Availability could not be loaded.");
        const data = (await response.json()) as { dates: DateAvailability[] };
        setAvailability(
          Object.fromEntries(
            data.dates.map(({ available, date }) => [date, available]),
          ),
        );
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setError(
          "Availability is temporarily unavailable. Please try again shortly.",
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [durationHours, month]);

  function goToMonth(nextMonth: string) {
    setIsLoading(true);
    setError(undefined);
    setSelectedDate(undefined);
    setMonth(nextMonth);
  }

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Skopje",
  }).format(new Date(`${month}-01T12:00:00Z`));

  return (
    <div className="border border-white/20 bg-background p-4 text-left sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
            {t("Choose a date")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">
            {monthLabel}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous month"
            className="grid h-11 w-11 place-items-center border border-white/20 text-lg disabled:cursor-not-allowed disabled:opacity-30"
            disabled={month === firstMonth}
            onClick={() => goToMonth(changeMonth(month, -1))}
            type="button"
          >
            ←
          </button>
          <button
            aria-label="Next month"
            className="grid h-11 w-11 place-items-center border border-white/20 text-lg"
            onClick={() => goToMonth(changeMonth(month, 1))}
            type="button"
          >
            →
          </button>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-7 gap-1 text-center text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div aria-live="polite" className="mt-2 grid grid-cols-7 gap-1">
        {datesForMonth(month).map(({ date, day, offset }) => {
          const available = availability[date] ?? false;
          return (
            <button
              aria-label={`${date}${available ? ", available" : ", unavailable"}`}
              className={cn(
                "aspect-square text-sm transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                selectedDate === date
                  ? "bg-white text-background"
                  : available
                    ? "bg-white/10 text-white hover:bg-accent"
                    : "cursor-not-allowed text-muted/35",
              )}
              disabled={!available || isLoading}
              key={date}
              onClick={() => {
                setSelectedDate(date);
                onDateSelect(date);
              }}
              style={
                offset === undefined
                  ? undefined
                  : { gridColumnStart: offset + 1 }
              }
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-white/70">{t("Loading dates…")}</p>
      ) : null}
      {error ? (
        <p className="mt-5 text-sm text-white/80" role="alert">
          {language === "mk" ? "Достапноста е моментално недостапна. Обиди се повторно наскоро." : error}
        </p>
      ) : null}
      {selectedDate ? (
        <p className="mt-5 text-sm text-white">
          {language === "mk" ? "Избран датум:" : "Selected date:"} <span className="font-bold">{selectedDate}</span>
        </p>
      ) : null}
    </div>
  );
}
