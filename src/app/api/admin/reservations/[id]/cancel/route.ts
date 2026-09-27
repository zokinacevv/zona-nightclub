import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";

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
  });
  return NextResponse.json({ reservation });
}
