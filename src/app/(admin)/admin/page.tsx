import { formatInTimeZone } from "date-fns-tz";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDatabase } from "@/lib/database";
import { CancelReservationButton } from "@/components/admin/cancel-reservation-button";
import { ConfirmReservationButton } from "@/components/admin/confirm-reservation-button";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  const now = new Date();
  let upcoming: Awaited<ReturnType<typeof listReservations>> = [];
  let past: Awaited<ReturnType<typeof listReservations>> = [];
  let unavailable = false;
  try {
    [upcoming, past] = await Promise.all([
      listReservations(now, true),
      listReservations(now, false),
    ]);
  } catch {
    unavailable = true;
  }
  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
          NOIR admin · {session.user.role}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Reservations</h1>
        <a
          className="mt-5 inline-flex min-h-11 items-center bg-accent px-5 text-sm font-bold tracking-[0.1em] text-white uppercase"
          href="/admin/reservations/new"
        >
          Add reservation
        </a>
        {unavailable ? (
          <p className="mt-6 border border-accent/40 bg-accent/10 p-4 text-sm">
            Connect DATABASE_URL and apply migrations to view reservations.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ReservationList title="Upcoming" items={upcoming} />
            <ReservationList title="Past" items={past} />
          </div>
        )}
      </div>
    </main>
  );
}

async function listReservations(now: Date, upcoming: boolean) {
  return getDatabase().reservation.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(upcoming ? { startsAt: { gte: now } } : { startsAt: { lt: now } }),
    },
    orderBy: { startsAt: upcoming ? "asc" : "desc" },
    take: 30,
  });
}

function ReservationList({
  title,
  items,
}: {
  title: string;
  items: Awaited<ReturnType<typeof listReservations>>;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="border border-white/10 p-5 text-sm text-muted">
            No reservations to show.
          </p>
        ) : (
          items.map((item) => (
            <article
              className="border border-white/10 bg-surface p-4"
              key={item.id}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.guestName}</p>
                  <p className="text-sm text-muted">
                    {item.phone} · {item.partySize} guests
                  </p>
                </div>
                <StatusBadge
                  status={
                    item.status === "NO_SHOW"
                      ? "no-show"
                      : (item.status.toLowerCase() as
                          "pending" | "confirmed" | "cancelled" | "expired")
                  }
                />
              </div>
              <p className="mt-3 text-sm">
                {formatInTimeZone(
                  item.startsAt,
                  "Europe/Skopje",
                  "d MMM yyyy · HH:mm",
                )}{" "}
                — {formatInTimeZone(item.endsAt, "Europe/Skopje", "HH:mm")}
              </p>
              <p className="mt-1 text-xs text-muted">
                {item.bookingSource.replaceAll("_", " ")} · Guest #{item.guestReservationCount}
              </p>
              {item.status === "PENDING" ? <ConfirmReservationButton id={item.id} /> : null}
              {item.status !== "CANCELLED" ? <CancelReservationButton id={item.id} /> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
