import type { PrismaClient } from "@/generated/prisma/client";
import {
  createReservationWindow,
  reservationBufferRange,
  type BookingDurationHours,
} from "@/lib/reservations/rules";
import { ReservationConflictError } from "@/lib/reservations/create";

export async function updatePendingReservation(
  database: PrismaClient,
  reservationId: string,
  input: {
    serviceDate: string;
    startTime: string;
    durationHours: BookingDurationHours;
  },
) {
  const window = createReservationWindow({
    serviceDate: input.serviceDate,
    startTime: input.startTime,
    durationHours: input.durationHours,
  });
  const reservationRange = reservationBufferRange(window);

  return database.$transaction(async (transaction) => {
    const existing = await transaction.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });

    if (!existing) throw new Error("Reservation not found.");
    if (existing.status !== "PENDING") {
      throw new Error("Only pending reservations can be edited.");
    }

    const [reservationConflict, availabilityBlockConflict] = await Promise.all([
      transaction.reservation.findFirst({
        where: {
          id: { not: reservationId },
          status: "CONFIRMED",
          startsAt: { lt: reservationRange.endsAt },
          endsAt: { gt: reservationRange.startsAt },
        },
        select: { id: true },
      }),
      transaction.availabilityBlock.findFirst({
        where: {
          startsAt: { lt: reservationRange.endsAt },
          endsAt: { gt: reservationRange.startsAt },
        },
        select: { id: true },
      }),
    ]);

    if (reservationConflict || availabilityBlockConflict) {
      throw new ReservationConflictError();
    }

    return transaction.reservation.update({
      where: { id: reservationId },
      data: {
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        blockedUntil: window.blockedUntil,
        guestCancellationTokenExpiresAt: window.startsAt,
      },
      select: {
        id: true,
        guestName: true,
        email: true,
        phone: true,
        partySize: true,
        guestNotes: true,
        startsAt: true,
        endsAt: true,
        status: true,
        guestCancellationTokenExpiresAt: true,
      },
    });
  });
}
