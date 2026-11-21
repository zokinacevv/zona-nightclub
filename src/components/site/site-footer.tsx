"use client";

import { useLanguage } from "@/lib/i18n";

const contactDetails = [
  { label: "Phone", value: "+389 78 533 677", href: "tel:+38978533677" },
  { label: "Address", value: "Којник 8, Велес", href: undefined },
];

const hours = [
  ["Monday — Thursday", "13:00 — 23:00"],
  ["Friday — Saturday", "13:00 — 00:00"],
  ["Sunday", "13:00 — 23:00"],
];

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer id="contact" className="scroll-mt-20 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-20 pb-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <a
          aria-label="Open ZONA location in Google Maps"
          className="group relative min-h-80 overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none sm:p-8"
          href="https://maps.app.goo.gl/GEbC9VeWfDoKhPNQ9"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div aria-hidden="true" className="absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_0%,transparent_48%,rgba(255,255,255,0.08)_48.2%,rgba(255,255,255,0.08)_48.5%,transparent_48.7%),linear-gradient(145deg,transparent_0%,transparent_40%,rgba(255,255,255,0.06)_40.2%,rgba(255,255,255,0.06)_40.5%,transparent_40.7%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,auto,3rem_3rem,3rem_3rem]" />
            <div className="absolute top-[23%] left-[18%] h-24 w-px rotate-[34deg] bg-white/25" />
            <div className="absolute right-[20%] bottom-[18%] h-36 w-px -rotate-[47deg] bg-white/20" />
            <div className="absolute top-[45%] left-[50%] h-5 w-5 rounded-full bg-accent shadow-[0_0_0_10px_rgba(225,6,0,0.14),0_0_50px_12px_rgba(225,6,0,0.45)] transition-transform duration-500 group-hover:scale-125" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/20" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.18em] text-muted uppercase backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t("Find ZONA")}
              </p>
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.16em] text-white/65 uppercase transition-colors group-hover:border-white/35 group-hover:text-white">
                {t("Open in Maps ↗")}
              </span>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                Којник 8, Велес
              </p>
              <p className="mt-2 text-sm text-muted">ZONA Private Club · Велес</p>
            </div>
          </div>
        </a>

        <div className="grid content-start gap-10 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              {t("Contact")}
            </p>
            <dl className="mt-5 grid gap-3">
              {contactDetails.map((detail) => (
                <div
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-4 transition-colors hover:border-white/25"
                  key={detail.label}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-accent">
                    {detail.label === "Phone" ? (
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path d="M6.6 3.5 9 3l2 5-2.5 1.5a15.2 15.2 0 0 0 6.5 6.5l1.5-2.5 5 2-.5 2.4a2.5 2.5 0 0 1-2.7 2C10.9 19.1 4.9 13.1 4.1 5.7a2.5 2.5 0 0 1 2.5-2.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7" />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <dt className="text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                      {t(detail.label)}
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                    {detail.href ? (
                      <a
                        className="transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                        href={detail.href}
                      >
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                    </dd>
                  </span>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              {t("Opening hours")}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              {hours.map(([day, time]) => (
                <div
                  className="flex justify-between gap-5 border-b border-white/10 pb-3"
                  key={day}
                >
                  <dt className="text-muted">{t(day)}</dt>
                  <dd className="text-right text-foreground">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-5 py-7 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} ZONA. {t("All nights reserved.")}</p>
        <div className="flex items-center gap-3">
          <a
            aria-label="Open ZONA on Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            href="https://www.instagram.com/zona_privateclub/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <rect height="18" rx="5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="3" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="6.5" fill="currentColor" r="1" />
            </svg>
            <span className="sr-only">Instagram</span>
          </a>
          <a
            aria-label="Open ZONA on Facebook"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            href="https://www.facebook.com/p/ZONA-PrivateClub-61555272743261/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.7.3-1 1-1Z" />
            </svg>
            <span className="sr-only">Facebook</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
