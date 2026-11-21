import {
  BookingSource,
  ReservationStatus,
  type PrismaClient,
} from "@/generated/prisma/client";
import {
  createReservationWindow,
  type BookingDurationHours,
} from "@/lib/reservations/rules";
import { createGuestCancellationToken } from "@/lib/reservations/cancellation";

export type CreateWebsiteReservationInput = {
  guestName: string;
  email: string;
  phone: string;
  partySize: number;
  serviceDate: string;
  startTime: string;
  durationHours: BookingDurationHours;
  guestNotes?: string;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  bookingSource?: BookingSource;
  status?: ReservationStatus;
  createdByUserId?: string;
};

export class ReservationConflictError extends Error {
  constructor() {
    super("This reservation time is no longer available.");
    this.name = "ReservationConflictError";
  }
}

export async function createWebsiteReservation(
  database: PrismaClient,
  input: CreateWebsiteReservationInput,
) {
  const window = createReservationWindow({
    serviceDate: input.serviceDate,
    startTime: input.startTime,
    durationHours: input.durationHours,
  });

  return database.$transaction(async (transaction) => {
    const [existingReservation, availabilityBlock, previousGuestReservations] = await Promise.all([
      transaction.reservation.findFirst({
        where: {
          status: ReservationStatus.CONFIRMED,
          startsAt: { lt: window.blockedUntil },
          blockedUntil: { gt: window.startsAt },
        },
        select: { id: true },
      }),
      transaction.availabilityBlock.findFirst({
        where: {
          startsAt: { lt: window.blockedUntil },
          endsAt: { gt: window.startsAt },
        },
        select: { id: true },
      }),
      transaction.reservation.count({
        where: {
          OR: [
            { email: input.email.toLowerCase() },
            { phone: input.phone.trim() },
          ],
        },
      }),
    ]);

    if (existingReservation || availabilityBlock) {
      throw new ReservationConflictError();
    }

    const reservation = await transaction.reservation.create({
      data: {
        guestName: input.guestName,
        email: input.email.toLowerCase(),
        phone: input.phone.trim(),
        partySize: input.partySize,
        guestReservationCount: previousGuestReservations + 1,
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        blockedUntil: window.blockedUntil,
        bookingSource: input.bookingSource ?? BookingSource.WEBSITE,
        createdByUserId: input.createdByUserId,
        guestNotes: input.guestNotes,
        termsAcceptedAt: input.termsAcceptedAt,
        termsVersion: input.termsVersion,
        status: input.status ?? ReservationStatus.PENDING,
        guestCancellationTokenExpiresAt: window.startsAt,
      },
      select: {
        id: true,
        blockedUntil: true,
        endsAt: true,
        email: true,
        guestName: true,
        guestNotes: true,
        guestReservationCount: true,
        partySize: true,
        phone: true,
        startsAt: true,
        status: true,
        guestCancellationTokenExpiresAt: true,
      },
    });

    return {
      ...reservation,
      guestCancellationToken: reservation.guestCancellationTokenExpiresAt
        ? createGuestCancellationToken(
            reservation.id,
            reservation.guestCancellationTokenExpiresAt,
          )
        : null,
    };
  });
}
