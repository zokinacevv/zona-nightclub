import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import {
  getBookingDuration,
  getDayAvailability,
  getMonthAvailability,
} from "@/lib/reservations/availability";
import { ReservationRuleError } from "@/lib/reservations/rules";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const database = getDatabase();
    const durationHours = getBookingDuration(searchParams.get("durationHours"));
    const date = searchParams.get("date");
    const month = searchParams.get("month");

    if (date) {
      const slots = await getDayAvailability(database, date, durationHours);
      return NextResponse.json({ date, durationHours, slots });
    }

    if (month) {
      const dates = await getMonthAvailability(database, month, durationHours);
      return NextResponse.json({ month, durationHours, dates });
    }

    return NextResponse.json(
      { error: "Provide either a date or month query parameter." },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof ReservationRuleError) {
      return NextResponse.json(
        { code: error.code, error: error.message },
        { status: 400 },
      );
    }

    console.error("Availability lookup failed", error);
    return NextResponse.json(
      { error: "Availability is temporarily unavailable." },
      { status: 500 },
    );
  }
}
