import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AvailabilityBlockForm } from "@/components/admin/availability-block-form";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";
export default async function Page() {
  const s = await getServerSession(authOptions);
  if (!s?.user) redirect("/admin/login");
  if (s.user.role !== "MANAGER") redirect("/admin");
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-semibold">Block venue</h1>
      <AvailabilityCalendar />
      <details className="mt-10 max-w-xl">
        <summary className="cursor-pointer text-sm text-muted">Use the duration-based blocker</summary>
        <AvailabilityBlockForm />
      </details>
    </main>
  );
}
