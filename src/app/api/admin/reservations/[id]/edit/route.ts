import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
import { updatePendingReservation } from "@/lib/reservations/update";
import { ReservationRuleError, reservationRules } from "@/lib/reservations/rules";
import { ReservationConflictError } from "@/lib/reservations/create";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as {
    serviceDate?: unknown;
    startTime?: unknown;
    durationHours?: unknown;
  };
  const serviceDate = typeof body.serviceDate === "string" ? body.serviceDate : "";
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  const durationHours = Number(body.durationHours);

  if (
    !Number.isInteger(durationHours) ||
    !reservationRules.allowedDurationsHours.includes(
      durationHours as (typeof reservationRules.allowedDurationsHours)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Choose a duration of 2, 3, 4, or 5 hours." },
      { status: 400 },
    );
  }

  try {
    const reservation = await updatePendingReservation(getDatabase(), id, {
      serviceDate,
      startTime,
      durationHours: durationHours as 2 | 3 | 4 | 5,
    });
    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationRuleError || error instanceof ReservationConflictError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Reservation not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message === "Only pending reservations can be edited.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Reservation edit failed", error);
    return NextResponse.json({ error: "Could not edit reservation." }, { status: 500 });
  }
}
