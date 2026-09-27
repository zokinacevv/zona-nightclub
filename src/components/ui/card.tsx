import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <article
      className={cn("border border-border bg-surface p-5 sm:p-6", className)}
      {...props}
    />
  );
}
