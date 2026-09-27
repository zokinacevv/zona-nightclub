import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";

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
    !body.reason?.trim() ||
    Number.isNaN(startsAt.valueOf()) ||
    Number.isNaN(endsAt.valueOf()) ||
    endsAt <= startsAt
  )
    return NextResponse.json(
      { error: "Provide a reason and valid block time range." },
      { status: 400 },
    );
  const block = await getDatabase().availabilityBlock.create({
    data: {
      startsAt,
      endsAt,
      reason: body.reason.trim(),
      notes: body.notes?.trim() || null,
    },
  });
  return NextResponse.json({ block }, { status: 201 });
}
