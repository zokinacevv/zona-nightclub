import type { BookingDurationHours } from "@/lib/reservations/rules";

const cancellationWindowMs = 7 * 24 * 60 * 60 * 1000;

const prices: Record<BookingDurationHours, number> = {
  2: 2500,
  3: 3000,
  4: 4000,
  5: 5000,
};

export function reservationPrice(durationHours: BookingDurationHours) {
  return prices[durationHours];
}

export function formatReservationPrice(amount: number) {
  return `${new Intl.NumberFormat("mk-MK").format(amount)} ден.`;
}

export function reservationDurationHours(startsAt: Date, endsAt: Date) {
  return Math.round((endsAt.getTime() - startsAt.getTime()) / (60 * 60 * 1000)) as BookingDurationHours;
}

export function cancellationFee(
  startsAt: Date,
  reservationAmount: number,
  now = new Date(),
) {
  const timeUntilReservation = startsAt.getTime() - now.getTime();
  if (timeUntilReservation > 0 && timeUntilReservation < cancellationWindowMs) {
    return Math.round(reservationAmount / 2);
  }
  return 0;
}
