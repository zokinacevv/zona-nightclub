import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ManualReservationForm } from "@/components/admin/manual-reservation-form";

export default async function NewReservationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
        ZONA admin
      </p>
      <h1 className="mt-3 text-4xl font-semibold">Add reservation</h1>
      <ManualReservationForm />
    </main>
  );
}
