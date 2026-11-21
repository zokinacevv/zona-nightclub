import { getServerSession } from "next-auth";
import { after, NextRequest, NextResponse } from "next/server";
import { BookingSource, ReservationStatus } from "@/generated/prisma/client";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { createWebsiteReservation } from "@/lib/reservations/create";
import { sendReservationStatusEmail } from "@/lib/reservations/email";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const source = body.bookingSource as BookingSource;
  const manualSources: BookingSource[] = [
    BookingSource.PHONE,
    BookingSource.PRIVATE,
    BookingSource.WALK_IN,
    BookingSource.ADMIN,
  ];
  if (!manualSources.includes(source))
    return NextResponse.json(
      { error: "Choose a valid booking source." },
      { status: 400 },
    );
  const partySize = Number(body.partySize);
  const durationHours = Number(body.durationHours);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 250) {
    return NextResponse.json({ error: "Party size must be between 1 and 250." }, { status: 400 });
  }
  if (![2, 3, 4, 5].includes(durationHours)) {
    return NextResponse.json({ error: "Choose a duration of 2, 3, 4, or 5 hours." }, { status: 400 });
  }
  try {
    const reservation = await createWebsiteReservation(getDatabase(), {
      guestName: String(body.guestName ?? "").trim(),
      email: String(body.email ?? "").trim().toLowerCase(),
      phone: String(body.phone ?? "").trim(),
      partySize,
      serviceDate: String(body.serviceDate ?? ""),
      startTime: String(body.startTime ?? ""),
      durationHours: durationHours as 2 | 3 | 4 | 5,
      guestNotes:
        typeof body.guestNotes === "string" && body.guestNotes.trim()
          ? body.guestNotes.trim()
          : undefined,
      bookingSource: source,
      status: ReservationStatus.CONFIRMED,
      createdByUserId: session.user.id,
    });
    after(async () => {
      try {
        if (reservation.email) {
          await sendReservationStatusEmail(reservation, "CONFIRMED");
        }
      } catch (error) {
        console.error("Manual reservation email failed", error);
      }
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create reservation.",
      },
      { status: 400 },
    );
  }
}
