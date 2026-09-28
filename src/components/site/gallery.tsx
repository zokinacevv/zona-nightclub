"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

const galleryItems = [
  {
    alt: "ZONA dance floor under white beams and red light",
    className: "col-span-2 row-span-2 aspect-[4/5] sm:col-span-1 sm:row-span-2",
    label: "01 — The floor",
    objectPosition: "50% 58%",
  },
  {
    alt: "Crowd at ZONA seen through the club's concrete interior",
    className: "col-span-1 aspect-square",
    label: "02 — After dark",
    objectPosition: "15% 40%",
  },
  {
    alt: "Nightclub atmosphere with a red-lit concrete wall",
    className: "col-span-1 aspect-square",
    label: "03 — Red room",
    objectPosition: "92% 55%",
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem =
    selectedIndex === null ? undefined : galleryItems[selectedIndex];

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
            eyebrow="Captured at ZONA"
            title={
              <>
                No two nights
                <br />
                look the <span className="text-accent">same.</span>
              </>
            }
          />
          <p className="max-w-xs text-sm leading-6 text-muted">
            A glimpse into the energy, the shadows, and the people who make the
            night move.
          </p>
        </div>

        <div className="relative mx-auto mt-12 h-64 max-w-5xl overflow-hidden sm:h-80 lg:h-96">
          {[-1, 0, 1].map((offset) => {
            const index = carouselIndexAt(offset);
            const item = galleryItems[index];
            const isActive = offset === 0;
            return (
              <button
                aria-label={`Open photo: ${item.label}`}
                className={cn(
                  "group absolute top-0 h-full overflow-hidden bg-surface text-left transition-[left,right,width,opacity,transform] duration-700 ease-in-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  isActive
                    ? "left-[13%] w-[74%] opacity-100 sm:left-[18%] sm:w-[64%]"
                    : offset === -1
                      ? "left-[-8%] w-[28%] opacity-60 sm:left-[-4%] sm:w-[24%]"
                      : "right-[-8%] w-[28%] opacity-60 sm:right-[-4%] sm:w-[24%]",
                )}
                key={`${item.label}-${offset}`}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <Image
                  alt={item.alt}
                  className="object-cover grayscale transition duration-500 group-hover:grayscale-0 motion-reduce:transition-none"
                  fill
                  priority={isActive}
                  sizes="(max-width: 640px) 74vw, 64vw"
                  src={item.src ?? "/images/noir-dancefloor.png"}
                  style={{ objectPosition: item.objectPosition }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                {isActive ? (
                  <span className="absolute right-4 bottom-4 left-4 text-sm font-bold tracking-[0.14em] text-white uppercase sm:right-5 sm:bottom-5 sm:left-5">
                    {item.label}
                  </span>
                ) : null}
              </button>
            );
          })}
          <p className="absolute right-1/2 bottom-3 translate-x-1/2 text-[0.65rem] font-bold tracking-[0.2em] text-white/70 uppercase">
            {String(carouselIndex + 1).padStart(2, "0")} / 04
          </p>
        </div>
      </div>

      <Dialog
        onClose={() => setSelectedIndex(null)}
        open={selectedItem !== undefined}
        title={selectedItem?.label ?? "Gallery image"}
      >
        {selectedItem ? (
          <div className="relative aspect-[2/3] overflow-hidden bg-background sm:aspect-[4/3]">
            <Image
              alt={selectedItem.alt}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 90vw, 640px"
              src={selectedItem.src ?? "/images/noir-dancefloor.png"}
              style={{ objectPosition: selectedItem.objectPosition }}
            />
          </div>
        ) : null}
      </Dialog>
    </section>
  );
}
