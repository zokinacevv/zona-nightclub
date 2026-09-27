import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-[#ff201a] active:bg-[#bd0000] disabled:bg-[#6e1714]",
  secondary:
    "border border-border bg-surface-raised text-foreground hover:border-muted hover:bg-[#292929] active:bg-[#303030]",
  ghost: "text-foreground hover:bg-white/10 active:bg-white/15",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, type = "button", variant = "primary", ...props },
    ref,
  ) {
    return (
      <button
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:text-white/65",
          variants[variant],
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
