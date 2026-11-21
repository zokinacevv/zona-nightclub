import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Managers only" }, { status: 403 });

  const { id } = await context.params;
  try {
    await getDatabase().availabilityBlock.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Blocked term was not found." }, { status: 404 });
  }
}
