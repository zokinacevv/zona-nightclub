"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem =
    selectedIndex === null ? undefined : galleryItems[selectedIndex];

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

        <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {galleryItems.map((item, index) => (
            <button
              aria-label={`Open photo: ${item.label}`}
              className={cn(
                "group relative overflow-hidden bg-surface text-left focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none",
                item.className,
              )}
              key={item.label}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image
                alt={item.alt}
                className="object-cover grayscale transition duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none"
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 26vw"
                src={item.src ?? "/images/noir-dancefloor.png"}
                style={{ objectPosition: item.objectPosition }}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3 text-xs font-bold tracking-[0.14em] text-white uppercase">
                {item.label}
                <span className="text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                  ↗
                </span>
              </span>
            </button>
          ))}
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
