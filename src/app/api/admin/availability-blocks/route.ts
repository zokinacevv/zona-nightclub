import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { ReservationStatus } from "@/generated/prisma/client";
import { reservationBufferRange } from "@/lib/reservations/rules";

function monthRange(month: string) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    startsAt: new Date(Date.UTC(year, monthNumber - 1, 1)),
    endsAt: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = monthRange(request.nextUrl.searchParams.get("month") ?? "");
  if (!range)
    return NextResponse.json({ error: "Provide a valid month." }, { status: 400 });

  const database = getDatabase();
  const reservationRange = reservationBufferRange(range);
  const [blocks, reservations] = await Promise.all([
    database.availabilityBlock.findMany({
      where: {
        startsAt: { lt: range.endsAt },
        endsAt: { gt: range.startsAt },
      },
      orderBy: { startsAt: "asc" },
      select: { id: true, startsAt: true, endsAt: true, reason: true, notes: true },
    }),
    database.reservation.findMany({
      where: {
        status: ReservationStatus.CONFIRMED,
        startsAt: { lt: reservationRange.endsAt },
        endsAt: { gt: reservationRange.startsAt },
      },
      orderBy: { startsAt: "asc" },
      select: { id: true, guestName: true, startsAt: true, endsAt: true, blockedUntil: true, status: true },
    }),
  ]);
  return NextResponse.json({ blocks, reservations });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Managers only" }, { status: 403 });
  const body = (await request.json()) as {
    startsAt?: string;
    endsAt?: string;
    reason?: string;
    notes?: string;
  };
  const startsAt = new Date(body.startsAt ?? "");
  const endsAt = new Date(body.endsAt ?? "");
  if (
    Number.isNaN(startsAt.valueOf()) ||
    Number.isNaN(endsAt.valueOf()) ||
    endsAt <= startsAt ||
    startsAt <= new Date()
  )
    return NextResponse.json(
      { error: "Provide a valid block time range." },
      { status: 400 },
    );
  const database = getDatabase();
  const reservationRange = reservationBufferRange({ startsAt, endsAt });
  const [reservationConflict, blockConflict] = await Promise.all([
    database.reservation.findFirst({
      where: {
        status: ReservationStatus.CONFIRMED,
        startsAt: { lt: reservationRange.endsAt },
        endsAt: { gt: reservationRange.startsAt },
      },
      select: { id: true },
    }),
    database.availabilityBlock.findFirst({
      where: {
        startsAt: { lt: reservationRange.endsAt },
        endsAt: { gt: reservationRange.startsAt },
      },
      select: { id: true },
    }),
  ]);
  if (reservationConflict || blockConflict)
    return NextResponse.json(
      { error: "This time is already reserved or blocked." },
      { status: 409 },
    );
  const block = await getDatabase().availabilityBlock.create({
    data: {
      startsAt,
      endsAt,
      reason: body.reason?.trim() || "Admin calendar block",
      notes: body.notes?.trim() || null,
    },
  });
  return NextResponse.json({ block }, { status: 201 });
}
