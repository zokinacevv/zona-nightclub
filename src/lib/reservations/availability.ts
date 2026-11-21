import type { PrismaClient } from "@/generated/prisma/client";
import { ReservationStatus } from "@/generated/prisma/client";
import {
  createReservationWindow,
  getServiceHours,
  hasTurnoverBufferConflict,
  ReservationRuleError,
  reservationBufferRange,
  reservationRules,
  type BookingDurationHours,
  type ReservationWindow,
} from "@/lib/reservations/rules";

type ReservationConflict = Pick<
  Awaited<ReturnType<PrismaClient["reservation"]["findMany"]>>[number],
  "startsAt" | "endsAt"
>;

type AvailabilityBlockConflict = Pick<
  Awaited<ReturnType<PrismaClient["availabilityBlock"]["findMany"]>>[number],
  "startsAt" | "endsAt"
>;

export type AvailableTimeSlot = {
  time: string;
  available: boolean;
};

export type AvailableDate = {
  date: string;
  available: boolean;
};

function minutesFromMidnight(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getCandidateStartTimes(serviceDate: string) {
  const serviceHours = getServiceHours(serviceDate);
  if (!serviceHours) return [];

  const opensAt = minutesFromMidnight(serviceHours.opensAt);
  const closesAt = minutesFromMidnight(serviceHours.closesAt);
  const serviceLength =
    closesAt <= opensAt ? 1440 - opensAt + closesAt : closesAt - opensAt;

  return Array.from(
    { length: Math.ceil(serviceLength / reservationRules.slotIntervalMinutes) },
    (_, index) =>
      timeFromMinutes(opensAt + index * reservationRules.slotIntervalMinutes),
  );
}

function getCandidateWindows(
  serviceDate: string,
  durationHours: BookingDurationHours,
  now: Date,
) {
  return getCandidateStartTimes(serviceDate).flatMap((startTime) => {
    try {
      return [
        {
          time: startTime,
          window: createReservationWindow(
            { serviceDate, startTime, durationHours },
            now,
          ),
        },
      ];
    } catch (error) {
      if (error instanceof ReservationRuleError) return [];
      throw error;
    }
  });
}

function windowIsAvailable(
  window: ReservationWindow,
  reservations: ReservationConflict[],
  availabilityBlocks: AvailabilityBlockConflict[],
) {
  return (
    !reservations.some((reservation) =>
      hasTurnoverBufferConflict(window, reservation),
    ) &&
    !availabilityBlocks.some((availabilityBlock) =>
      hasTurnoverBufferConflict(window, availabilityBlock),
    )
  );
}

async function getConflicts(
  database: PrismaClient,
  windows: ReservationWindow[],
) {
  if (windows.length === 0) {
    return { availabilityBlocks: [], reservations: [] };
  }

  const rangeStart = windows.reduce(
    (earliest, window) =>
      window.startsAt < earliest ? window.startsAt : earliest,
    windows[0].startsAt,
  );
  const rangeEnd = windows.reduce(
    (latest, window) =>
      window.blockedUntil > latest ? window.blockedUntil : latest,
    windows[0].blockedUntil,
  );
  const reservationRange = reservationBufferRange({
    startsAt: rangeStart,
    endsAt: rangeEnd,
  });

  const [reservations, availabilityBlocks] = await Promise.all([
    database.reservation.findMany({
      where: {
        status: ReservationStatus.CONFIRMED,
        startsAt: { lt: reservationRange.endsAt },
        endsAt: { gt: reservationRange.startsAt },
      },
      select: { endsAt: true, startsAt: true },
    }),
    database.availabilityBlock.findMany({
      where: {
        startsAt: { lt: reservationRange.endsAt },
        endsAt: { gt: reservationRange.startsAt },
      },
      select: { endsAt: true, startsAt: true },
    }),
  ]);

  return { availabilityBlocks, reservations };
}

export async function getDayAvailability(
  database: PrismaClient,
  serviceDate: string,
  durationHours: BookingDurationHours,
  now = new Date(),
): Promise<AvailableTimeSlot[]> {
  const candidates = getCandidateWindows(serviceDate, durationHours, now);
  const { availabilityBlocks, reservations } = await getConflicts(
    database,
    candidates.map(({ window }) => window),
  );

  return candidates.map(({ time, window }) => ({
    time,
    available: windowIsAvailable(window, reservations, availabilityBlocks),
  }));
}

function datesInMonth(month: string) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) {
    throw new ReservationRuleError(
      "DATE_INVALID",
      "Choose a valid month in YYYY-MM format.",
    );
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from(
    { length: totalDays },
    (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`,
  );
}

export async function getMonthAvailability(
  database: PrismaClient,
  month: string,
  durationHours: BookingDurationHours,
  now = new Date(),
): Promise<AvailableDate[]> {
  const dates = datesInMonth(month);
  const candidatesByDate = dates.map((date) => ({
    date,
    candidates: getCandidateWindows(date, durationHours, now),
  }));
  const allWindows = candidatesByDate.flatMap(({ candidates }) =>
    candidates.map(({ window }) => window),
  );
  const { availabilityBlocks, reservations } = await getConflicts(
    database,
    allWindows,
  );

  return candidatesByDate.map(({ candidates, date }) => ({
    date,
    available: candidates.some(
      ({ window }) => windowIsAvailable(window, reservations, availabilityBlocks),
    ),
  }));
}

export function getBookingDuration(value: string | null): BookingDurationHours {
  const duration = Number(value ?? "2");

  if (
    !reservationRules.allowedDurationsHours.includes(
      duration as BookingDurationHours,
    )
  ) {
    throw new ReservationRuleError(
      "DURATION_INVALID",
      "Choose a reservation duration of 2, 3, 4, or 5 hours.",
    );
  }

  return duration as BookingDurationHours;
}
