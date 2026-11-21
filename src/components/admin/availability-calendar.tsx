"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Block = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  notes: string | null;
};

type ReservedWindow = {
  id: string;
  guestName: string;
  startsAt: string;
  endsAt: string;
  blockedUntil: string;
  status: string;
};

const allStartTimes = Array.from({ length: 22 }, (_, index) => {
  const totalMinutes = 13 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const durations = [2, 3, 4, 5] as const;

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function serviceHoursForDate(date: string) {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return [
    { opensAt: "13:00", closesAt: "23:00" },
    { opensAt: "13:00", closesAt: "23:00" },
    { opensAt: "13:00", closesAt: "23:00" },
    { opensAt: "13:00", closesAt: "23:00" },
    { opensAt: "13:00", closesAt: "23:00" },
    { opensAt: "13:00", closesAt: "00:00" },
    { opensAt: "13:00", closesAt: "00:00" },
  ][weekday];
}

function startTimesForDate(date: string, durationHours: number) {
  const serviceHours = serviceHoursForDate(date);
  if (!serviceHours) return allStartTimes;
  const opensAt = minutesFromTime(serviceHours.opensAt);
  let closesAt = minutesFromTime(serviceHours.closesAt);
  if (closesAt <= opensAt) closesAt += 24 * 60;
  const latestStart = closesAt - durationHours * 60;
  return allStartTimes.filter((time) => minutesFromTime(time) <= latestStart);
}

function endTimeFor(date: string, startTime: string, durationHours: number) {
  if (!date) return "—";
  const startsAt = new Date(`${date}T${startTime}`);
  const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(endsAt);
}

const turnoverBufferMs = 90 * 60 * 1000;

function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}`;
}

function changeMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function datesForMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: totalDays }, (_, index) => ({
    date: `${month}-${String(index + 1).padStart(2, "0")}`,
    day: index + 1,
    offset: index === 0 ? firstDay : undefined,
  }));
}

function localDateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function displayDate(value: string) {
  return localDateKey(value).split("-").reverse().join("-");
}

function localTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Skopje",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function todayInSkopje() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function AvailabilityCalendar() {
  const [mode, setMode] = useState<"block" | "reservation">("block");
  const [firstMonth] = useState(() => currentMonth());
  const [month, setMonth] = useState(firstMonth);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reservations, setReservations] = useState<ReservedWindow[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [durationHours, setDurationHours] = useState<(typeof durations)[number]>(2);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStartTimes = useMemo(
    () => startTimesForDate(selectedDate, durationHours),
    [selectedDate, durationHours],
  );

  async function loadBlocks(nextMonth: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/availability-blocks?month=${nextMonth}`);
      if (!response.ok) throw new Error("Could not load blocks.");
      const data = (await response.json()) as { blocks: Block[]; reservations: ReservedWindow[] };
      setBlocks(data.blocks);
      setReservations(data.reservations);
    } catch {
      setMessage("Could not load blocked terms.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/availability-blocks?month=${month}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load blocks.");
        const data = (await response.json()) as { blocks: Block[]; reservations: ReservedWindow[] };
        if (!cancelled) {
          setBlocks(data.blocks);
          setReservations(data.reservations);
        }
      })
      .catch(() => {
        if (!cancelled) setMessage("Could not load blocked terms.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const blocksByDate = useMemo(() => {
    const result: Record<string, Block[]> = {};
    for (const block of blocks) {
      const date = localDateKey(block.startsAt);
      (result[date] ??= []).push(block);
    }
    return result;
  }, [blocks]);

  const reservationsByDate = useMemo(() => {
    const result: Record<string, ReservedWindow[]> = {};
    for (const reservation of reservations) {
      const date = localDateKey(reservation.startsAt);
      (result[date] ??= []).push(reservation);
    }
    return result;
  }, [reservations]);

  const calendarItems = useMemo(
    () => [
      ...blocks.map((block) => ({ kind: "block" as const, item: block })),
      ...reservations.map((reservation) => ({
        kind: "reservation" as const,
        item: reservation,
      })),
    ].sort(
      (left, right) =>
        new Date(left.item.startsAt).getTime() -
        new Date(right.item.startsAt).getTime(),
    ),
    [blocks, reservations],
  );

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Skopje",
  }).format(new Date(`${month}-01T12:00:00Z`));

  function selectDate(date: string) {
    setSelectedDate(date);
    const nextStartTimes = startTimesForDate(date, durationHours);
    if (!nextStartTimes.includes(startTime)) setStartTime(nextStartTimes[0] ?? "");
    setMessage(undefined);
  }

  function goToMonth(nextMonth: string) {
    setIsLoading(true);
    setMessage(undefined);
    setMonth(nextMonth);
  }

  function windowIsOccupied(nextStartTime: string, nextDurationHours: number) {
    if (!selectedDate) return false;
    const startsAt = new Date(`${selectedDate}T${nextStartTime}`);
    const endsAt = new Date(
      startsAt.getTime() + nextDurationHours * 60 * 60 * 1000,
    );
    const blockedUntil = new Date(endsAt.getTime() + turnoverBufferMs);
    const overlaps = (existingStart: string, existingEnd: string) =>
      new Date(existingStart) < blockedUntil && new Date(existingEnd) > startsAt;
    return (
      reservations.some((reservation) =>
        overlaps(reservation.startsAt, reservation.blockedUntil),
      ) ||
      blocks.some((block) => overlaps(block.startsAt, block.endsAt))
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDate) {
      setMessage("Select a date.");
      return;
    }
    const startsAt = new Date(`${selectedDate}T${startTime}`);
    const endsAt = new Date(
      startsAt.getTime() + durationHours * 60 * 60 * 1000,
    );
    if (endsAt <= startsAt) {
      setMessage("End time must be after start time.");
      return;
    }
    if (startsAt <= new Date()) {
      setMessage("Only future terms can be blocked.");
      return;
    }

    setIsSubmitting(true);
    setMessage(undefined);
    const endpoint = mode === "block"
      ? "/api/admin/availability-blocks"
      : "/api/admin/reservations";
    const body = mode === "block"
      ? {
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        }
      : {
          guestName: guestName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          partySize: Number(partySize),
          serviceDate: selectedDate,
          startTime,
          durationHours,
          bookingSource: "ADMIN",
        };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsSubmitting(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "Could not create blocked term.");
      return;
    }
    setMessage(
      mode === "block"
        ? "Blocked term created. It is now unavailable on the official site."
        : "Reservation created and confirmation email sent.",
    );
    if (mode === "block") await loadBlocks(month);
    if (mode === "reservation") {
      setGuestName("");
      setEmail("");
      setPhone("");
      setPartySize("1");
    }
  }

  async function unblock(block: Block) {
    if (!window.confirm(`Unblock ${displayDate(block.startsAt)} ${localTime(block.startsAt)}–${localTime(block.endsAt)}?`)) return;
    setMessage(undefined);
    const response = await fetch(`/api/admin/availability-blocks/${block.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "Could not unblock the term.");
      return;
    }
    setMessage("Term unblocked. It is available again on the official site.");
    await loadBlocks(month);
  }

  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className="border border-white/20 bg-background p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">Blocked terms</p>
            <h2 className="mt-2 text-2xl font-semibold">{monthLabel}</h2>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Previous month"
              className="grid h-11 w-11 place-items-center border border-white/20 disabled:opacity-30"
              disabled={month === firstMonth}
              onClick={() => goToMonth(changeMonth(month, -1))}
              type="button"
            >←</button>
            <button
              aria-label="Next month"
              className="grid h-11 w-11 place-items-center border border-white/20"
              onClick={() => goToMonth(changeMonth(month, 1))}
              type="button"
            >→</button>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-7 gap-1 text-center text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {datesForMonth(month).map(({ date, day, offset }) => {
            const hasBlocks = Boolean(blocksByDate[date]?.length);
            const hasReservations = Boolean(reservationsByDate[date]?.length);
            const isUnavailable = hasBlocks || hasReservations;
            return (
              <button
                aria-label={`${date}${isUnavailable ? ", unavailable" : ", available"}`}
                className={cn(
                  "relative aspect-square border text-sm transition-colors",
                  selectedDate === date
                    ? "border-white bg-white text-background"
                    : isUnavailable
                      ? "border-accent/70 bg-accent/20 text-white hover:bg-accent"
                      : "border-white/10 text-white hover:border-white/50",
                )}
                key={date}
                onClick={() => selectDate(date)}
                style={offset === undefined ? undefined : { gridColumnStart: offset + 1 }}
                type="button"
              >
                {day}
                {isUnavailable ? <span className="absolute right-1 bottom-1 h-1 w-1 rounded-full bg-accent" /> : null}
              </button>
            );
          })}
        </div>
        {isLoading ? <p className="mt-5 text-sm text-muted">Loading blocked terms…</p> : null}
        <details className="group mt-6 border border-white/10 bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold marker:hidden">
            <span>Blocked and reserved terms ({calendarItems.length})</span>
            <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-2 border-t border-white/10 p-4">
            {calendarItems.map(({ kind, item }) =>
              kind === "block" ? (
                <div className="flex items-start justify-between gap-3 border-l-2 border-accent pl-3 text-sm" key={item.id}>
                  <div>
                    <p className="font-semibold">{displayDate(item.startsAt)} · {localTime(item.startsAt)}–{localTime(item.endsAt)}</p>
                    <p className="text-muted">{item.reason}</p>
                  </div>
                  <button
                    className="shrink-0 text-xs font-bold tracking-[0.08em] text-accent uppercase hover:text-white"
                    onClick={() => void unblock(item)}
                    type="button"
                  >
                    Unblock
                  </button>
                </div>
              ) : (
                <div className="border-l-2 border-white/50 pl-3 text-sm" key={item.id}>
                  <p className="font-semibold">{displayDate(item.startsAt)} · {localTime(item.startsAt)}–{localTime(item.endsAt)}</p>
                  <p className="text-muted">{item.guestName} · Reserved ({item.status.toLowerCase()})</p>
                </div>
              ),
            )}
            {!isLoading && calendarItems.length === 0 ? <p className="text-sm text-muted">No blocked or reserved terms this month.</p> : null}
          </div>
        </details>
      </div>

      <form className="h-fit space-y-5 border border-white/10 bg-surface p-5" onSubmit={submit}>
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">Admin actions</p>
          <h2 className="mt-2 text-2xl font-semibold">Select date and time</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={cn("min-h-11 border px-3 text-sm font-semibold", mode === "reservation" ? "border-accent bg-accent text-white" : "border-white/20 text-muted")}
            onClick={() => setMode("reservation")}
            type="button"
          >
            Add reservation
          </button>
          <button
            className={cn("min-h-11 border px-3 text-sm font-semibold", mode === "block" ? "border-accent bg-accent text-white" : "border-white/20 text-muted")}
            onClick={() => setMode("block")}
            type="button"
          >
            Block term
          </button>
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="calendar-block-date">Date</label>
          <input
            className="mt-2 w-full border border-white/20 bg-background p-3"
            id="calendar-block-date"
            min={todayInSkopje()}
            onChange={(event) => selectDate(event.target.value)}
            required
            type="date"
            value={selectedDate}
          />
          {selectedDate ? (
            <p className="mt-2 text-sm text-muted">Selected date: <span className="font-semibold text-foreground">{selectedDate.split("-").reverse().join("-")}</span></p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Start time</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {availableStartTimes.map((time) => (
              <button
                className={cn(
                  "min-h-10 border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                  time === startTime
                    ? "border-accent bg-accent text-white"
                    : "border-white/20 text-muted hover:border-white/50 hover:text-foreground",
                )}
                key={time}
                disabled={windowIsOccupied(time, durationHours)}
                onClick={() => setStartTime(time)}
                type="button"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Duration</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {durations.map((duration) => (
              <button
                className={cn(
                  "min-h-11 border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                  duration === durationHours
                    ? "border-accent bg-accent text-white"
                    : "border-white/20 text-muted hover:border-white/50 hover:text-foreground",
                )}
                key={duration}
                disabled={
                  !startTimesForDate(selectedDate, duration).includes(startTime) ||
                  windowIsOccupied(startTime, duration)
                }
                onClick={() => {
                  setDurationHours(duration);
                  const nextStartTimes = startTimesForDate(selectedDate, duration);
                  if (!nextStartTimes.includes(startTime)) setStartTime(nextStartTimes[0] ?? "");
                }}
                type="button"
              >
                {duration}h
              </button>
            ))}
          </div>
          <p className="mt-3 border border-white/10 bg-background p-3 text-sm text-muted">
            Blocked from <span className="font-semibold text-foreground">{startTime}</span> to <span className="font-semibold text-foreground">{endTimeFor(selectedDate, startTime, durationHours)}</span>
          </p>
        </div>
        {mode === "reservation" ? (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm font-semibold">Guest details</p>
            <input className="w-full border border-white/20 bg-background p-3" onChange={(event) => setGuestName(event.target.value)} placeholder="Guest name" required value={guestName} />
            <input className="w-full border border-white/20 bg-background p-3" onChange={(event) => setEmail(event.target.value)} placeholder="Email" required type="email" value={email} />
            <input className="w-full border border-white/20 bg-background p-3" onChange={(event) => setPhone(event.target.value)} placeholder="Phone" required type="tel" value={phone} />
            <input className="w-full border border-white/20 bg-background p-3" min="1" onChange={(event) => setPartySize(event.target.value)} placeholder="Number of guests" required type="number" value={partySize} />
          </div>
        ) : null}
        <button className="w-full bg-accent p-3 font-bold text-white uppercase disabled:opacity-50" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving…" : mode === "reservation" ? "Add reservation & send email" : "Block selected term"}
        </button>
        {message ? <p className="text-sm text-muted" role="status">{message}</p> : null}
      </form>
    </section>
  );
}
