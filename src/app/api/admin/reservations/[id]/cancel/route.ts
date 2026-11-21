import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { sendReservationStatusEmail } from "@/lib/reservations/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await request.json()) as { reason?: unknown };
  if (typeof body.reason !== "string" || !body.reason.trim())
    return NextResponse.json(
      { error: "A cancellation reason is required." },
      { status: 400 },
    );
  const reservation = await getDatabase().reservation.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: body.reason.trim(),
      cancelledByUserId: session.user.id,
    },
    select: {
      id: true, guestName: true, email: true, phone: true,
      partySize: true, guestNotes: true, startsAt: true, endsAt: true,
      status: true, guestCancellationTokenExpiresAt: true,
    },
  });
  await sendReservationStatusEmail(
    reservation,
    "CANCELLED",
    body.reason.trim(),
    "admin",
  );
  return NextResponse.json({ reservation });
}
