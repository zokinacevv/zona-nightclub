"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  children,
  className,
  onClose,
  open,
  title,
}: DialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <section
        className={cn(
          "w-full max-w-lg border border-border bg-surface p-5 shadow-2xl sm:p-6",
          className,
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground" id={titleId}>
            {title}
          </h2>
          <Button
            aria-label="Close dialog"
            className="min-h-11 min-w-11 px-3"
            onClick={onClose}
            ref={closeButtonRef}
            variant="ghost"
          >
            ×
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
