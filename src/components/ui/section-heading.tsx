import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  title,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold tracking-[0.22em] text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
