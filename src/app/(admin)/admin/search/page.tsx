import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/database";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const s = await getServerSession(authOptions);
  if (!s?.user) redirect("/admin/login");
  const q = (await searchParams).q?.trim();
  const rows = q
    ? await getDatabase().reservation.findMany({
        where: {
          OR: [
            { guestName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { referenceCode: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { startsAt: "desc" },
      })
    : [];
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-semibold">Guest history</h1>
      <form className="mt-6 flex gap-2">
        <input
          className="min-h-11 flex-1 border bg-surface px-3"
          defaultValue={q}
          name="q"
          placeholder="Name, phone, email, or reference"
        />
        <button className="bg-accent px-5 font-bold uppercase">Search</button>
      </form>
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <article className="border p-4" key={r.id}>
            <b>{r.guestName}</b>
            <p>
              {r.phone} · {r.email} · {r.status}
            </p>
            <p>{r.referenceCode}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
