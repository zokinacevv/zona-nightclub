"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { useLanguage } from "@/lib/i18n";

const details = [
  ["Capacity", "70"],
  ["Location", "UpTown"],
  ["Since", "2024"],
];

export function About() {
  const { t } = useLanguage();
  return (
    <section
      id="about"
      className="scroll-mt-20 overflow-hidden border-b border-white/10 bg-background py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-10">
        <div className="relative min-h-120 overflow-hidden border border-white/15 bg-[#0c0d10] sm:min-h-136" aria-label="ZONA venue layout">
          <div className="venue-grid absolute inset-0" />
          <div className="venue-glow venue-glow-one" />
          <div className="venue-glow venue-glow-two" />
          <div className="venue-beam venue-beam-one" />
          <div className="venue-beam venue-beam-two" />
          <div className="absolute top-5 left-5 z-10 flex items-center gap-2 border border-white/20 bg-black/35 px-3 py-2 text-[0.625rem] font-bold tracking-[0.18em] text-white/80 uppercase backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {t("Live venue layout")}
          </div>

          <div className="venue-zone venue-zone-dj">
            <span className="venue-zone-number">01</span>
            <span>{t("DJ stage")}</span>
            <small>{t("pro sound")}</small>
          </div>
          <div className="venue-zone venue-zone-bar">
            <span className="venue-zone-number">02</span>
            <span>{t("Bar")}</span>
          </div>
          <div className="venue-zone venue-zone-vip">
            <span className="venue-zone-number">03</span>
            <span>{t("VIP lounge")}</span>
            <small>{t("the big booth")}</small>
          </div>
          <div className="venue-zone venue-zone-booth-one">
            <span>{t("Stage booth 01")}</span>
          </div>
          <div className="venue-zone venue-zone-booth-two">
            <span>{t("Stage booth 02")}</span>
          </div>

          <div className="venue-floor">
            <span className="venue-floor-label">{t("Main floor")}</span>
            <span className="venue-floor-subtitle">{t("professional lighting / sound")}</span>
            <span className="venue-floor-light venue-floor-light-one" />
            <span className="venue-floor-light venue-floor-light-two" />
            <span className="venue-floor-light venue-floor-light-three" />
          </div>

          <div className="venue-table venue-table-one" />
          <div className="venue-table venue-table-two" />
          <div className="venue-table venue-table-three" />
          <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4">
            <p className="text-[0.625rem] font-bold tracking-[0.2em] text-white/55 uppercase">
              {t("Sound · light · after-hours")}
            </p>
            <span className="text-2xl text-accent">↗</span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <SectionHeading
            eyebrow={t("The ZONA story")}
            title={
              <>
                {t("This is not a club.")}
                <br />
                {t("It is a ")}<span className="text-accent">{t("moment.")}</span>
              </>
            }
          />
          <p className="mt-8 max-w-xl text-base leading-8 text-muted sm:text-lg">
            {t("ZONA brings together sound, light, and the people who know how to make a night last. Come early for the atmosphere. Stay late for what happens when the lights disappear.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Sound", "Light", "People"].map((item) => (
              <span
                className="border border-white/15 px-3 py-2 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase transition-colors hover:border-accent hover:text-white"
                key={item}
              >
                {t(item)}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-2 sm:grid-cols-3">
            {details.map(([label, value]) => (
              <div
                className="group/stat border border-white/10 bg-surface p-4 transition-colors hover:border-accent/60 sm:p-5"
                key={label}
              >
                <p className="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover/stat:text-accent">
                  {value}
                </p>
                <p className="mt-1 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                  {t(label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
