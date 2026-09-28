import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { sendReservationStatusEmail } from "@/lib/reservations/email";

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

  const reservation = await database.reservation.update({
    where: { id },
    data: { status: "CONFIRMED" },
    select: {
      id: true, guestName: true, email: true, phone: true,
      partySize: true, guestNotes: true, startsAt: true, endsAt: true,
      status: true, guestCancellationTokenExpiresAt: true,
    },
  });
  await sendReservationStatusEmail(reservation, "CONFIRMED");
  return NextResponse.json({ reservation });
}
