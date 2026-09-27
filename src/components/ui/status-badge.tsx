import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Status = "pending" | "confirmed" | "cancelled" | "expired" | "no-show";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: Status;
};

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
  "no-show": "No-show",
};

const statusClasses: Record<Status, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  confirmed: "border-success/40 bg-success/10 text-success",
  cancelled: "border-accent/40 bg-accent/10 text-[#ff817d]",
  expired: "border-border bg-white/5 text-muted",
  "no-show": "border-border bg-white/5 text-muted",
};

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.14em] uppercase",
        statusClasses[status],
        className,
      )}
      {...props}
    >
      {statusLabels[status]}
    </span>
  );
}
