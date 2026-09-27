import { addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export type BookingDurationHours = 2 | 3 | 4;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ServiceHours = {
  opensAt: string;
  closesAt: string;
};

export const reservationRules = {
  timezone: "Europe/Skopje",
  allowedDurationsHours: [2, 3, 4] as const,
  slotIntervalMinutes: 30,
  turnoverBufferMinutes: 90,
  minimumAdvanceMinutes: 120,
  bookingWindowDays: 180,
  weeklySchedule: {
    0: { opensAt: "13:00", closesAt: "00:00" },
    1: { opensAt: "13:00", closesAt: "23:00" },
    2: { opensAt: "13:00", closesAt: "23:00" },
    3: { opensAt: "13:00", closesAt: "23:00" },
    4: { opensAt: "13:00", closesAt: "23:00" },
    5: { opensAt: "13:00", closesAt: "00:00" },
    6: { opensAt: "13:00", closesAt: "00:00" },
  } satisfies Record<Weekday, ServiceHours | null>,
} as const;

export type ReservationRequest = {
  serviceDate: string;
  startTime: string;
  durationHours: number;
};

export type ReservationWindow = {
  serviceDate: string;
  startsAt: Date;
  endsAt: Date;
  blockedUntil: Date;
  serviceHours: ServiceHours;
};

export class ReservationRuleError extends Error {
  constructor(
    public readonly code:
      | "DATE_INVALID"
      | "DURATION_INVALID"
      | "CLOSED"
      | "TIME_INVALID"
      | "TOO_SOON"
      | "TOO_FAR_AHEAD"
      | "OUTSIDE_SERVICE_HOURS",
    message: string,
  ) {
    super(message);
    this.name = "ReservationRuleError";
  }
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function minutesFromMidnight(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

function weekdayForDate(date: string): Weekday {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as Weekday;
}

function isOvernight(serviceHours: ServiceHours) {
  return (
    minutesFromMidnight(serviceHours.closesAt) <=
    minutesFromMidnight(serviceHours.opensAt)
  );
}

function hasStartTimeInServiceWindow(time: string, serviceHours: ServiceHours) {
  const timeInMinutes = minutesFromMidnight(time);
  const opensAt = minutesFromMidnight(serviceHours.opensAt);
  const closesAt = minutesFromMidnight(serviceHours.closesAt);

  if (isOvernight(serviceHours)) {
    return timeInMinutes >= opensAt || timeInMinutes < closesAt;
  }

  return timeInMinutes >= opensAt && timeInMinutes < closesAt;
}

function getActualStartDate(
  serviceDate: string,
  startTime: string,
  serviceHours: ServiceHours,
) {
  if (
    isOvernight(serviceHours) &&
    minutesFromMidnight(startTime) < minutesFromMidnight(serviceHours.closesAt)
  ) {
    return addCalendarDays(serviceDate, 1);
  }

  return serviceDate;
}

function toZonedInstant(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, reservationRules.timezone);
}

function getClosingInstant(serviceDate: string, serviceHours: ServiceHours) {
  const closingDate = isOvernight(serviceHours)
    ? addCalendarDays(serviceDate, 1)
    : serviceDate;

  return toZonedInstant(closingDate, serviceHours.closesAt);
}

function assertBookingWindow(serviceDate: string, start: Date, now: Date) {
  const firstAllowedStart = addMinutes(
    now,
    reservationRules.minimumAdvanceMinutes,
  );
  if (start < firstAllowedStart) {
    throw new ReservationRuleError(
      "TOO_SOON",
      `Reservations must be made at least ${reservationRules.minimumAdvanceMinutes / 60} hours in advance.`,
    );
  }

  const todayAtVenue = formatInTimeZone(
    now,
    reservationRules.timezone,
    "yyyy-MM-dd",
  );
  const latestServiceDate = addCalendarDays(
    todayAtVenue,
    reservationRules.bookingWindowDays,
  );

  if (serviceDate > latestServiceDate) {
    throw new ReservationRuleError(
      "TOO_FAR_AHEAD",
      `Reservations can be made up to ${reservationRules.bookingWindowDays} days ahead.`,
    );
  }
}

export function getServiceHours(serviceDate: string): ServiceHours | null {
  if (!isDateOnly(serviceDate)) return null;
  return reservationRules.weeklySchedule[weekdayForDate(serviceDate)];
}

export function createReservationWindow(
  request: ReservationRequest,
  now = new Date(),
): ReservationWindow {
  const { durationHours, serviceDate, startTime } = request;

  if (!isDateOnly(serviceDate)) {
    throw new ReservationRuleError(
      "DATE_INVALID",
      "Choose a valid reservation date.",
    );
  }

  if (!isTime(startTime)) {
    throw new ReservationRuleError(
      "TIME_INVALID",
      "Choose a valid reservation start time.",
    );
  }

  if (
    !reservationRules.allowedDurationsHours.includes(
      durationHours as BookingDurationHours,
    )
  ) {
    throw new ReservationRuleError(
      "DURATION_INVALID",
      "Reservations can last 2, 3, or 4 hours.",
    );
  }

  const serviceHours = getServiceHours(serviceDate);
  if (!serviceHours) {
    throw new ReservationRuleError(
      "CLOSED",
      "The venue is closed on this date.",
    );
  }

  if (!hasStartTimeInServiceWindow(startTime, serviceHours)) {
    throw new ReservationRuleError(
      "OUTSIDE_SERVICE_HOURS",
      "Choose a start time within the venue's opening hours.",
    );
  }

  const actualStartDate = getActualStartDate(
    serviceDate,
    startTime,
    serviceHours,
  );
  const startsAt = toZonedInstant(actualStartDate, startTime);
  const endsAt = addMinutes(startsAt, durationHours * 60);
  const blockedUntil = addMinutes(
    endsAt,
    reservationRules.turnoverBufferMinutes,
  );
  const closingAt = getClosingInstant(serviceDate, serviceHours);

  assertBookingWindow(serviceDate, startsAt, now);

  // The reservation itself must end by closing time. The turnover period is
  // venue operations after service and may continue after the club closes.
  if (endsAt > closingAt) {
    throw new ReservationRuleError(
      "OUTSIDE_SERVICE_HOURS",
      "The reservation must finish before the venue closes.",
    );
  }

  return {
    serviceDate,
    startsAt,
    endsAt,
    blockedUntil,
    serviceHours,
  };
}
