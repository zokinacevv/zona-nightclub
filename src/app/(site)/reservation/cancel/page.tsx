import { GuestCancellationForm } from "@/components/site/guest-cancellation-form";

export default async function CancelReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <main className="min-h-screen bg-background px-5 py-24 text-foreground sm:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">ZONA Private Club</p>
        <h1 className="mt-4 text-4xl font-semibold">Cancel reservation</h1>
        <p className="mt-4 text-muted">Use the button below to cancel the reservation connected to this private link.</p>
        <GuestCancellationForm token={token} />
      </div>
    </main>
  );
}
