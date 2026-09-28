import { NextRequest, NextResponse } from "next/server";
import { verifyGuestCancellationToken } from "@/lib/reservations/cancellation";
import { getDatabase } from "@/lib/database";
import { sendReservationStatusEmail } from "@/lib/reservations/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const verified = verifyGuestCancellationToken(token);
  if (!verified)
    return NextResponse.json({ error: "This cancellation link is invalid or expired." }, { status: 400 });

  const database = getDatabase();
  const existing = await database.reservation.findUnique({
    where: { id: verified.reservationId },
    select: {
      id: true, guestName: true, email: true, phone: true,
      partySize: true, guestNotes: true, startsAt: true, endsAt: true,
      status: true, guestCancellationTokenExpiresAt: true,
    },
  });
  if (!existing || !existing.guestCancellationTokenExpiresAt ||
      existing.guestCancellationTokenExpiresAt.getTime() !== verified.expiresAt.getTime()) {
    return NextResponse.json({ error: "This cancellation link is invalid or expired." }, { status: 400 });
  }
  if (existing.status === "CANCELLED")
    return NextResponse.json({ message: "This reservation is already cancelled." });
  if (existing.status !== "PENDING" && existing.status !== "CONFIRMED")
    return NextResponse.json({ error: "This reservation can no longer be cancelled." }, { status: 400 });

  const reservation = await database.reservation.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: "Cancelled by guest",
    },
    select: {
      id: true, guestName: true, email: true, phone: true,
      partySize: true, guestNotes: true, startsAt: true, endsAt: true,
      status: true, guestCancellationTokenExpiresAt: true,
    },
  });
  await sendReservationStatusEmail(reservation, "CANCELLED", "Cancelled by guest");
  return NextResponse.json({ message: "Reservation cancelled successfully." });
}
