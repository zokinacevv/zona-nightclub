import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { sendReservationStatusEmail } from "@/lib/reservations/email";
import { ReservationConflictError } from "@/lib/reservations/create";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const database = getDatabase();
  const existing = await database.reservation.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending reservations can be confirmed." },
      { status: 400 },
    );
  }

  try {
    const reservation = await database.$transaction(async (transaction) => {
      const pending = await transaction.reservation.findUnique({
        where: { id },
        select: { status: true, startsAt: true, blockedUntil: true },
      });
      if (!pending) throw new Error("Not found");
      if (pending.status !== "PENDING") {
        throw new Error("Only pending reservations can be confirmed.");
      }

      const [reservationConflict, availabilityBlockConflict] = await Promise.all([
        transaction.reservation.findFirst({
          where: {
            id: { not: id },
            status: "CONFIRMED",
            startsAt: { lt: pending.blockedUntil },
            blockedUntil: { gt: pending.startsAt },
          },
          select: { id: true },
        }),
        transaction.availabilityBlock.findFirst({
          where: {
            startsAt: { lt: pending.blockedUntil },
            endsAt: { gt: pending.startsAt },
          },
          select: { id: true },
        }),
      ]);
      if (reservationConflict || availabilityBlockConflict) {
        throw new ReservationConflictError();
      }

      return transaction.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
        select: {
          id: true, guestName: true, email: true, phone: true,
          partySize: true, guestNotes: true, startsAt: true, endsAt: true,
          status: true, guestCancellationTokenExpiresAt: true,
        },
      });
    });
    await sendReservationStatusEmail(reservation, "CONFIRMED");
    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationConflictError) {
      return NextResponse.json(
        { error: "This reservation time is no longer available." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "Only pending reservations can be confirmed.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Reservation confirmation failed", error);
    return NextResponse.json({ error: "Could not confirm reservation." }, { status: 500 });
  }
}
