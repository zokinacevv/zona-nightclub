import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
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
  try {
    const reservation = await createWebsiteReservation(getDatabase(), {
      ...body,
      bookingSource: source,
      status: ReservationStatus.CONFIRMED,
      createdByUserId: session.user.id,
    });
    if (reservation.email) {
      await sendReservationStatusEmail(reservation, "CONFIRMED");
    }
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
