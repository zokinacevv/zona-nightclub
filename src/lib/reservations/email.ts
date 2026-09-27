import { formatInTimeZone } from "date-fns-tz";
import { Resend } from "resend";

type ReservationEmailData = {
  referenceCode: string;
  guestName: string;
  email: string;
  phone: string;
  partySize: number;
  guestNotes: string | null;
  startsAt: Date;
  endsAt: Date;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function reservationDetails(reservation: ReservationEmailData) {
  const date = formatInTimeZone(
    reservation.startsAt,
    "Europe/Skopje",
    "EEEE, d MMMM yyyy",
  );
  const startTime = formatInTimeZone(
    reservation.startsAt,
    "Europe/Skopje",
    "HH:mm",
  );
  const endTime = formatInTimeZone(
    reservation.endsAt,
    "Europe/Skopje",
    "HH:mm",
  );
  return { date, endTime, startTime };
}

export async function sendReservationEmails(reservation: ReservationEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATIONS_FROM_EMAIL;
  const staffRecipients = process.env.RESERVATIONS_STAFF_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!apiKey || !from || !staffRecipients?.length) {
    console.warn(
      "Reservation email not sent: Resend environment variables are missing.",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const details = reservationDetails(reservation);
  const guestName = escapeHtml(reservation.guestName);

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: [reservation.email],
      subject: `ZONA reservation received — ${reservation.referenceCode}`,
      html: `<main style="font-family:Arial,sans-serif;color:#111"><h1>We received your reservation.</h1><p>Hi ${guestName}, your ZONA reservation is being held.</p><p><strong>${details.date}</strong><br>${details.startTime}–${details.endTime}<br>${reservation.partySize} guests</p><p>Reference: <strong>${reservation.referenceCode}</strong></p></main>`,
    }),
    resend.emails.send({
      from,
      to: staffRecipients,
      subject: `New ZONA reservation — ${reservation.referenceCode}`,
      html: `<main style="font-family:Arial,sans-serif;color:#111"><h1>New website reservation</h1><p><strong>${guestName}</strong> · ${escapeHtml(reservation.phone)} · ${escapeHtml(reservation.email)}</p><p><strong>${details.date}</strong><br>${details.startTime}–${details.endTime}<br>${reservation.partySize} guests</p><p>Reference: <strong>${reservation.referenceCode}</strong></p><p>Notes: ${escapeHtml(reservation.guestNotes ?? "None")}</p></main>`,
    }),
  ]);

  results.forEach((result) => {
    if (result.status === "rejected")
      console.error("Reservation email failed", result.reason);
  });
}
