"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n";

const galleryItems = [
  {
    alt: "ZONA lounge booths with mirrored mosaic walls",
    className: "col-span-2 row-span-2 aspect-[4/5] sm:col-span-1 sm:row-span-2",
    label: "01 — The lounge",
    objectPosition: "50% 58%",
    src: "/images/zona-gallery-booths-final.png",
  },
  {
    alt: "ZONA lounge with marble wall, curtains, and white banquette",
    className: "col-span-1 aspect-square",
    label: "02 — After dark",
    objectPosition: "15% 40%",
    src: "/images/zona-gallery-lounge.png",
  },
  {
    alt: "Nightclub atmosphere with a red-lit concrete wall",
    className: "col-span-1 aspect-square",
    label: "03 — Red room",
    objectPosition: "92% 55%",
    src: "/images/zona-gallery-room.png",
  },
  {
    alt: "DJ booth and dancing crowd beneath overhead lights",
    className: "col-span-2 aspect-[2/1] sm:col-span-2",
    label: "04 — One more song",
    objectPosition: "50% 35%",
    src: "/images/zona-one-more-song.png",
  },
];

export function Gallery() {
  const { t } = useLanguage();
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % galleryItems.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  function carouselIndexAt(offset: number) {
    return (carouselIndex + offset + galleryItems.length) % galleryItems.length;
  }

  return (
    <section
      id="gallery"
      className="scroll-mt-20 border-b border-white/10 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={t("Captured at ZONA")}
            title={
              <>
                {t("No two nights")}
                <br />
                {t("look the ")}<span className="text-accent">{t("same.")}</span>
              </>
            }
          />
          <p className="max-w-xs text-sm leading-6 text-muted">
            {t("A glimpse into the energy, the shadows, and the people who make the night move.")}
          </p>
        </div>

        <div className="relative mx-auto mt-12 h-[21rem] max-w-6xl overflow-hidden sm:h-[26rem] lg:h-[31rem]">
          {[-1, 0, 1].map((offset) => {
            const index = carouselIndexAt(offset);
            const item = galleryItems[index];
            const isActive = offset === 0;
            return (
              <button
                aria-label={`${isActive ? "Current photo" : "Show photo"}: ${item.label}`}
                aria-pressed={isActive}
                className={cn(
                  "group absolute top-1/2 h-[88%] overflow-hidden rounded-2xl border bg-surface text-left shadow-2xl transition-[left,right,width,opacity,transform,border-color,box-shadow] duration-700 ease-in-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  isActive
                    ? "z-20 left-[8%] w-[84%] -translate-y-1/2 scale-100 border-white/35 opacity-100 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:left-[17%] sm:w-[66%] lg:left-[24%] lg:w-[52%]"
                    : offset === -1
                      ? "z-10 left-[-13%] w-[27%] -translate-y-1/2 scale-[0.88] border-white/10 opacity-55 shadow-[0_14px_40px_rgba(0,0,0,0.3)] sm:left-[-5%] sm:w-[24%] lg:left-[2%] lg:w-[22%]"
                      : "z-10 right-[-13%] w-[27%] -translate-y-1/2 scale-[0.88] border-white/10 opacity-55 shadow-[0_14px_40px_rgba(0,0,0,0.3)] sm:right-[-5%] sm:w-[24%] lg:right-[2%] lg:w-[22%]",
                )}
                key={`${item.label}-${offset}`}
                onClick={() => setCarouselIndex(index)}
                type="button"
              >
                <Image
                  alt={item.alt}
                  className={cn(
                    "object-cover transition duration-700 motion-reduce:transition-none",
                    isActive
                      ? "grayscale-0"
                      : "grayscale group-hover:grayscale-0",
                  )}
                  fill
                  priority={isActive}
                  sizes="(max-width: 640px) 84vw, (max-width: 1024px) 66vw, 52vw"
                  src={item.src ?? "/images/noir-dancefloor.png"}
                  style={{ objectPosition: item.objectPosition }}
                />
                <span
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent",
                    !isActive && "from-black/20",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
