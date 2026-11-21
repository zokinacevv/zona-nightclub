"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";

export function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] items-start overflow-hidden border-b border-white/10 bg-background lg:items-end">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          alt="ZONA private club interior with tables and booths"
          className="object-cover grayscale"
          fill
          priority
          sizes="100vw"
          src="/images/zona-hero-fixed-v3.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,12,0.78)_0%,rgba(10,10,12,0.42)_48%,rgba(10,10,12,0.32)_100%),linear-gradient(0deg,rgba(10,10,12,0.74)_0%,transparent_58%)]" />
        <div className="absolute -top-1/2 -right-1/4 h-[85vw] w-[85vw] rounded-full border border-white/15" />
        <div className="absolute -top-[37%] -right-[12%] h-[62vw] w-[62vw] rounded-full border border-white/10" />
        <div className="absolute top-[10%] right-[19%] h-[26vw] w-[26vw] rounded-full bg-white/8 blur-3xl" />
        <div className="absolute right-[16%] bottom-0 h-3/4 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        <div className="absolute right-[31%] bottom-0 h-2/3 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-[8%] h-[52%] w-[35%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_50%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black_40%,black)]" />
        <div className="absolute right-[10%] bottom-[17%] h-20 w-20 rounded-full bg-accent/70 blur-[70px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-7xl flex-col justify-between px-5 pt-4 pb-10 sm:px-8 sm:pt-6 sm:pb-14 lg:min-h-0 lg:px-10 lg:pt-24 lg:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
          <div className="flex min-h-[calc(100svh-8rem)] flex-col text-center lg:min-h-0 lg:block lg:text-left">
            <div className="flex translate-y-8 justify-center sm:translate-y-10 lg:translate-y-0 lg:translate-x-28">
              <Image
                alt="ZONA Private Club"
                className="h-auto w-full max-w-[34rem] object-contain lg:max-w-[48rem]"
                height={809}
                priority
                src="/images/zona-mobile-logo.png"
                width={1942}
              />
            </div>
            <p className="mt-8 hidden max-w-lg text-base leading-7 text-muted lg:block lg:text-lg">
              {t("A private club for great music, late conversations, and nights that are only getting started.")}
            </p>
            <div className="mt-auto flex flex-col justify-center gap-3 pt-8 sm:flex-row lg:mt-9 lg:justify-start lg:pt-0">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-6 text-sm font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-[#ff201a] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                href="#reservations"
              >
                {t("RESERVE NOW")}
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 px-6 text-sm font-bold tracking-[0.1em] text-foreground uppercase transition-colors hover:border-foreground hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                href="#about"
              >
                {t("Discover ZONA")}
              </a>
            </div>
          </div>

          <div className="hidden border-l border-white/20 pl-5 xl:block xl:pb-2">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              {t("After dark")}
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-foreground">
              {t("Your night starts here.")}
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-foreground uppercase transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              href="#reservations"
            >
              {t("Reserve now")}
            </a>
          </div>
        </div>

        <div className="mt-10 hidden items-center gap-4 text-[0.6875rem] font-bold tracking-[0.2em] text-muted uppercase sm:mt-20 sm:flex">
          <span className="h-px flex-1 bg-white/15" />
          {t("Scroll to enter")}
          <span className="h-px w-8 bg-white/15" />
        </div>
      </div>
    </section>
  );
}
