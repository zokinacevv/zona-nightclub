import { formatInTimeZone } from "date-fns-tz";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDatabase } from "@/lib/database";
import { CancelReservationButton } from "@/components/admin/cancel-reservation-button";
import { ConfirmReservationButton } from "@/components/admin/confirm-reservation-button";
import { EditReservationButton } from "@/components/admin/edit-reservation-button";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  const now = new Date();
  let upcoming: Awaited<ReturnType<typeof listReservations>> = [];
  let incoming: Awaited<ReturnType<typeof listIncomingReservations>> = [];
  let past: Awaited<ReturnType<typeof listReservations>> = [];
  let unavailable = false;
  try {
    [incoming, upcoming, past] = await Promise.all([
      listIncomingReservations(),
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
          ZONA admin · {session.user.role}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Reservations</h1>
        {unavailable ? (
          <p className="mt-6 border border-accent/40 bg-accent/10 p-4 text-sm">
            Connect DATABASE_URL and apply migrations to view reservations.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.4fr)]">
            <div className="space-y-8">
              <ReservationList
                collapsible={false}
                title="Incoming reservations"
                items={incoming}
              />
              <ReservationList title="Upcoming confirmed" items={upcoming} />
              <ReservationList title="Past" items={past} />
            </div>
            <AvailabilityCalendar />
          </div>
        )}
      </div>
    </main>
  );
}

async function listReservations(now: Date, upcoming: boolean) {
  return getDatabase().reservation.findMany({
    where: {
      status: upcoming ? "CONFIRMED" : { not: "CANCELLED" },
      ...(upcoming ? { startsAt: { gte: now } } : { startsAt: { lt: now } }),
    },
    orderBy: { startsAt: upcoming ? "asc" : "desc" },
    take: 30,
  });
}

async function listIncomingReservations() {
  return getDatabase().reservation.findMany({
    where: { status: "PENDING" },
    orderBy: { startsAt: "asc" },
    take: 30,
  });
}

function ReservationList({
  title,
  items,
  collapsible = true,
}: {
  title: string;
  items: Awaited<ReturnType<typeof listReservations>>;
  collapsible?: boolean;
}) {
  const list = (
    <div className={collapsible ? "space-y-3 border-t border-white/10 p-4" : "mt-4 space-y-3"}>
      {items.length === 0 ? (
        <p className="border border-white/10 p-5 text-sm text-muted">
          No reservations to show.
        </p>
      ) : (
        items.map((item) => (
            <details
              className="group border border-white/10 bg-surface"
              key={item.id}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:hidden">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.guestName}</p>
                  <p className="text-sm text-muted">
                    {formatInTimeZone(item.startsAt, "Europe/Skopje", "dd-MM-yyyy · HH:mm")} — {formatInTimeZone(item.endsAt, "Europe/Skopje", "HH:mm")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge
                    status={
                      item.status === "NO_SHOW"
                        ? "no-show"
                        : (item.status.toLowerCase() as
                            "pending" | "confirmed" | "cancelled" | "expired")
                    }
                  />
                  <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
                </div>
              </summary>
              <div className="border-t border-white/10 px-4 pb-4 pt-3">
                <p className="text-sm text-muted">
                  {item.phone} · {item.partySize} guests
                </p>
                <p className="mt-1 text-xs text-muted">
                  {item.bookingSource.replaceAll("_", " ")} · Guest #{item.guestReservationCount}
                </p>
                {item.status === "PENDING" ? (
                  <>
                    <EditReservationButton
                      id={item.id}
                      startsAt={item.startsAt.toISOString()}
                      endsAt={item.endsAt.toISOString()}
                    />
                    <ConfirmReservationButton id={item.id} />
                  </>
                ) : null}
                {item.status !== "CANCELLED" ? <CancelReservationButton id={item.id} /> : null}
              </div>
            </details>
        ))
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <section>
        <h2 className="text-xl font-semibold">{title}</h2>
        {list}
      </section>
    );
  }

  return (
    <details className="group border border-white/10 bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:hidden">
        <span className="text-xl font-semibold">{title}</span>
        <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
      </summary>
      {list}
    </details>
  );
}
