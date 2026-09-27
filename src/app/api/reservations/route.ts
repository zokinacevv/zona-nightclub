import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import {
  createWebsiteReservation,
  ReservationConflictError,
  type CreateWebsiteReservationInput,
} from "@/lib/reservations/create";
import { sendReservationEmails } from "@/lib/reservations/email";
import {
  ReservationRuleError,
  reservationRules,
  type BookingDurationHours,
} from "@/lib/reservations/rules";

export const runtime = "nodejs";

type ReservationRequestBody = {
  guestName?: unknown;
  email?: unknown;
  phone?: unknown;
  partySize?: unknown;
  serviceDate?: unknown;
  startTime?: unknown;
  durationHours?: unknown;
  guestNotes?: unknown;
};

function requiredText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ReservationRuleError("DATE_INVALID", `${fieldName} is required.`);
  }

  return value.trim();
}

function parseRequestBody(
  body: ReservationRequestBody,
): CreateWebsiteReservationInput {
  const guestName = requiredText(body.guestName, "Guest name");
  const email = requiredText(body.email, "Email").toLowerCase();
  const phone = requiredText(body.phone, "Phone number");
  const serviceDate = requiredText(body.serviceDate, "Reservation date");
  const startTime = requiredText(body.startTime, "Reservation time");
  const partySize = Number(body.partySize);
  const durationHours = Number(body.durationHours) as BookingDurationHours;
  const guestNotes =
    typeof body.guestNotes === "string" && body.guestNotes.trim()
      ? body.guestNotes.trim()
      : undefined;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ReservationRuleError(
      "DATE_INVALID",
      "Enter a valid email address.",
    );
  }

  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 250) {
    throw new ReservationRuleError(
      "DATE_INVALID",
      "Party size must be between 1 and 250 guests.",
    );
  }

  if (!reservationRules.allowedDurationsHours.includes(durationHours)) {
    throw new ReservationRuleError(
      "DURATION_INVALID",
      "Choose a reservation duration of 2, 3, or 4 hours.",
    );
  }

  return {
    guestName,
    email,
    phone,
    partySize,
    serviceDate,
    startTime,
    durationHours,
    guestNotes,
  };
}

function isDatabaseConflict(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Reservation_active_time_window_exclusion")
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReservationRequestBody;
    const reservation = await createWebsiteReservation(
      getDatabase(),
      parseRequestBody(body),
    );

    await sendReservationEmails(reservation);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (
      error instanceof ReservationConflictError ||
      isDatabaseConflict(error)
    ) {
      return NextResponse.json(
        {
          code: "SLOT_UNAVAILABLE",
          error: "This reservation time is no longer available.",
        },
        { status: 409 },
      );
    }

    if (error instanceof ReservationRuleError) {
      return NextResponse.json(
        { code: error.code, error: error.message },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Send a valid JSON reservation request." },
        { status: 400 },
      );
    }

    console.error("Reservation creation failed", error);
    return NextResponse.json(
      { error: "We could not save your reservation. Please try again." },
      { status: 500 },
    );
  }
}
