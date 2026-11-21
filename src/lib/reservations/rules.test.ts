import assert from "node:assert/strict";
import test from "node:test";
import { formatInTimeZone } from "date-fns-tz";
import {
  ReservationRuleError,
  createReservationWindow,
  hasTurnoverBufferConflict,
  reservationRules,
} from "@/lib/reservations/rules";

const now = new Date("2026-10-01T12:00:00.000Z");

test("adds a 90-minute turnover block after a three-hour Saturday reservation", () => {
  const window = createReservationWindow(
    {
      serviceDate: "2026-10-03",
      startTime: "13:00",
      durationHours: 3,
    },
    now,
  );

  assert.equal(
    formatInTimeZone(window.endsAt, reservationRules.timezone, "HH:mm"),
    "16:00",
  );
  assert.equal(
    formatInTimeZone(window.blockedUntil, reservationRules.timezone, "HH:mm"),
    "17:30",
  );
});

test("allows turnover to continue after closing", () => {
  const window = createReservationWindow(
    {
      serviceDate: "2026-10-03",
      startTime: "20:00",
      durationHours: 4,
    },
    now,
  );

  assert.equal(
    formatInTimeZone(window.endsAt, reservationRules.timezone, "HH:mm"),
    "00:00",
  );
  assert.equal(
    formatInTimeZone(window.blockedUntil, reservationRules.timezone, "HH:mm"),
    "01:30",
  );
});

test("rejects bookings that end after closing", () => {
  assert.throws(
    () =>
      createReservationWindow(
        {
          serviceDate: "2026-10-03",
          startTime: "21:00",
          durationHours: 4,
        },
        now,
      ),
    (error: unknown) =>
      error instanceof ReservationRuleError &&
      error.code === "OUTSIDE_SERVICE_HOURS",
  );
});

test("allows Sunday reservations that finish at 23:00 but rejects later ones", () => {
  const reservation = createReservationWindow(
    {
      serviceDate: "2026-10-04",
      startTime: "20:00",
      durationHours: 3,
    },
    now,
  );

  assert.equal(
    formatInTimeZone(reservation.endsAt, reservationRules.timezone, "HH:mm"),
    "23:00",
  );
  assert.throws(
    () =>
      createReservationWindow(
        {
          serviceDate: "2026-10-04",
          startTime: "20:30",
          durationHours: 3,
        },
        now,
      ),
    (error: unknown) =>
      error instanceof ReservationRuleError &&
      error.code === "OUTSIDE_SERVICE_HOURS",
  );
});

test("keeps the 90-minute buffer before and after reservations and blocked terms", () => {
  const reservation = createReservationWindow(
    {
      serviceDate: "2026-11-28",
      startTime: "17:00",
      durationHours: 2,
    },
    now,
  );
  const endsAtBufferStart = createReservationWindow(
    {
      serviceDate: "2026-11-28",
      startTime: "13:30",
      durationHours: 2,
    },
    now,
  );
  const overlapsPreBuffer = createReservationWindow(
    {
      serviceDate: "2026-11-28",
      startTime: "14:00",
      durationHours: 2,
    },
    now,
  );
  const overlapsPostBuffer = createReservationWindow(
    {
      serviceDate: "2026-11-28",
      startTime: "19:00",
      durationHours: 2,
    },
    now,
  );
  const startsAtBufferEnd = createReservationWindow(
    {
      serviceDate: "2026-11-28",
      startTime: "20:30",
      durationHours: 2,
    },
    now,
  );

  assert.equal(hasTurnoverBufferConflict(endsAtBufferStart, reservation), false);
  assert.equal(hasTurnoverBufferConflict(overlapsPreBuffer, reservation), true);
  assert.equal(hasTurnoverBufferConflict(overlapsPostBuffer, reservation), true);
  assert.equal(hasTurnoverBufferConflict(startsAtBufferEnd, reservation), false);
});
