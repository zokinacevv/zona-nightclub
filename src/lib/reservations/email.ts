import { formatInTimeZone } from "date-fns-tz";
import { Resend } from "resend";
import { createGuestCancellationToken } from "@/lib/reservations/cancellation";

export type ReservationEmailData = {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  partySize: number;
  guestNotes: string | null;
  startsAt: Date;
  endsAt: Date;
  status: string;
  guestCancellationTokenExpiresAt: Date | null;
  guestCancellationToken?: string | null;
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

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

function cancellationUrl(reservation: ReservationEmailData) {
  if (!reservation.guestCancellationTokenExpiresAt) return null;
  const token = reservation.guestCancellationToken ?? createGuestCancellationToken(reservation.id, reservation.guestCancellationTokenExpiresAt);
  return `${siteUrl().replace(/\/$/, "")}/reservation/cancel?token=${encodeURIComponent(token)}`;
}

function detailsTable(reservation: ReservationEmailData) {
  const details = reservationDetails(reservation);
  const row = (label: string, value: string) => `<tr><td colspan="2" style="padding:8px 0;text-align:center"><div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px">${label}</div><div style="font-weight:700;font-size:17px">${value}</div></td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:22px 0">${row("Guest", escapeHtml(reservation.guestName))}${row("Date", escapeHtml(details.date))}${row("Time", `${details.startTime}–${details.endTime}`)}${row("Guests", String(reservation.partySize))}</table>`;
}

function emailLayout(title: string, content: string) {
  const logoUrl = `${siteUrl().replace(/\/$/, "")}/images/zona-logo-black.png`;
  return `<div style="margin:0;background:#f4f4f4;padding:28px 12px;color:#171717;font-family:Arial,sans-serif;line-height:1.5"><main style="margin:0 auto;max-width:620px;background:#fff;text-align:center"><div style="padding:18px 24px 8px;border-bottom:1px solid #f0f0f0"><img src="${logoUrl}" alt="ZONA Private Club" width="220" height="190" style="display:block;width:220px;height:190px;margin:0 auto;object-fit:cover;object-position:center" /><h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:#111">${title}</h1></div><div style="padding:28px 30px 34px">${content}<p style="margin:28px 0 0;color:#999;font-size:12px">ZONA Private Club · Skopje</p></div></main></div>`;
}

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATIONS_FROM_EMAIL;
  const staffRecipients = process.env.RESERVATIONS_STAFF_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!apiKey || !from || !staffRecipients?.length) {
    console.warn("Reservation email not sent: Resend environment variables are missing.");
    return null;
  }
  return { apiKey, from, staffRecipients };
}

export async function sendReservationEmails(reservation: ReservationEmailData) {
  const settings = config();
  if (!settings) return;

  const resend = new Resend(settings.apiKey);
  const guestName = escapeHtml(reservation.guestName);
  const manageUrl = cancellationUrl(reservation);
  const manageButton = manageUrl
    ? `<p style="margin:26px 0"><a href="${manageUrl}" style="display:inline-block;background:#e32b12;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700">Cancel reservation</a></p><p style="font-size:12px;color:#777">You can use this private link to cancel your request before the reservation time.</p>`
    : "";

  const results = await Promise.allSettled([
    resend.emails.send({
      from: settings.from,
      to: [reservation.email],
      subject: "ZONA reservation request received",
      html: emailLayout("Reservation request received", `<p style="font-size:18px;margin:0 0 18px">Hi ${guestName}</p><p style="color:#777;margin:0 0 22px">We received your reservation request. It is currently <strong style="color:#222">pending confirmation</strong>.</p>${detailsTable(reservation)}${manageButton}<p style="color:#777">We will email you again as soon as the reservation is confirmed or cancelled.</p>`),
    }),
    resend.emails.send({
      from: settings.from,
      to: settings.staffRecipients,
      subject: "New ZONA reservation request",
      html: emailLayout("New reservation request", `<p style="font-size:18px;margin:0 0 18px"><strong>${guestName}</strong></p>${detailsTable(reservation)}<p style="color:#777"><strong>Phone:</strong> ${escapeHtml(reservation.phone)}<br><strong>Email:</strong> ${escapeHtml(reservation.email)}<br><strong>Notes:</strong> ${escapeHtml(reservation.guestNotes ?? "None")}</p><p>Open the admin panel to confirm or cancel this reservation.</p>`),
    }),
  ]);

  results.forEach((result) => {
    if (result.status === "rejected")
      console.error("Reservation email failed", result.reason);
  });
}

export async function sendReservationStatusEmail(
  reservation: ReservationEmailData,
  status: "CONFIRMED" | "CANCELLED",
  reason?: string | null,
) {
  const settings = config();
  if (!settings) return;

  const resend = new Resend(settings.apiKey);
  const guestName = escapeHtml(reservation.guestName);
  const confirmed = status === "CONFIRMED";
  const manageUrl = confirmed ? cancellationUrl(reservation) : null;
  const manageButton = manageUrl
    ? `<p style="margin:26px 0"><a href="${manageUrl}" style="display:inline-block;background:#e32b12;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700">Cancel reservation</a></p>`
    : "";
  const reasonText = reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : "";

  const result = await resend.emails.send({
    from: settings.from,
    to: [reservation.email],
    subject: confirmed
      ? "ZONA reservation confirmed"
      : "ZONA reservation cancelled",
      html: emailLayout(confirmed ? "Reservation confirmed" : "Reservation cancelled", `<p style="font-size:18px;margin:0 0 18px">Hi ${guestName}</p><p style="color:#777;margin:0 0 22px">Your ZONA reservation has been <strong style="color:#222">${confirmed ? "confirmed" : "cancelled"}</strong>.</p>${detailsTable(reservation)}${reasonText}${manageButton}`),
  });
  if (result.error) console.error("Reservation status email failed", result.error);
}

function logFailures(results: PromiseSettledResult<unknown>[]) {
  results.forEach((result) => {
    if (result.status === "rejected") console.error("Reservation email failed", result.reason);
  });
}
