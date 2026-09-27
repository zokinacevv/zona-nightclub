"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const navigationItems = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reservations", label: "Reservations" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 12);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        hasScrolled
          ? "border-white/10 bg-background/90 backdrop-blur-xl"
          : "border-transparent bg-background/35 backdrop-blur-sm",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8"
      >
        <a
          aria-label="ZONA home"
          className="group flex items-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          href="#top"
          onClick={() => setIsOpen(false)}
        >
          <Image
            alt=""
            className="h-14 w-16 object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-105"
            height={96}
            priority
            src="/images/zona-mark.png"
            width={96}
          />
          <span className="sr-only">ZONA</span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navigationItems.map((item) => (
            <a
              className="text-xs font-bold tracking-[0.13em] text-white uppercase transition-colors hover:text-white/80 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-sm bg-accent px-4 text-xs font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#ff201a] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            href="#reservations"
          >
            BOOK YOUR NIGHT
          </a>
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="grid min-h-11 min-w-11 place-items-center text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span
              className={cn(
                "h-px w-full bg-current transition-transform duration-200",
                isOpen && "translate-y-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-current transition-opacity duration-200",
                isOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-current transition-transform duration-200",
                isOpen && "-translate-y-[7px] -rotate-45",
              )}
            />
          </span>
        </button>
      </nav>

      <div
        className={cn(
          "grid overflow-hidden border-t border-white/10 transition-[grid-template-rows] duration-300 lg:hidden",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent",
        )}
        id="mobile-navigation"
      >
        <div className="min-h-0">
          <div className="mx-auto max-w-7xl px-5 py-5">
            <div className="flex flex-col items-start gap-1">
              {navigationItems.map((item) => (
                <a
                  className="w-full rounded-sm px-3 py-3 text-sm font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <a
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-sm bg-accent px-5 text-sm font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#ff201a] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              href="#reservations"
              onClick={() => setIsOpen(false)}
            >
              BOOK YOUR NIGHT
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
