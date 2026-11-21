"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

const products = [
  { name: "Hoodie", code: "01", kind: "hoodie" },
  { name: "Hat", code: "02", kind: "hat" },
  { name: "T-Shirt", code: "03", kind: "shirt" },
  { name: "Socks", code: "04", kind: "socks" },
] as const;

const hoodieImages = [
  {
    src: "/images/zona-hoodie-predna.png",
    alt: "ZONA black hoodie front design",
  },
  {
    src: "/images/zona-hoodie-napred.png",
    alt: "ZONA black hoodie back design",
  },
] as const;

const tshirtImages = [
  {
    src: "/images/zona-tshirt-back.png",
    alt: "ZONA white T-shirt back design",
  },
  {
    src: "/images/zona-tshirt-front.png",
    alt: "ZONA white T-shirt front design",
  },
] as const;

const hatImages = [
  {
    src: "/images/zona-hat-back.png",
    alt: "ZONA black hat front design",
  },
  {
    src: "/images/zona-hat-front.png",
    alt: "ZONA black hat back design",
  },
] as const;

type MerchImage = { src: string; alt: string };

function MerchCarousel({
  images,
  label,
}: {
  images: readonly MerchImage[];
  label: string;
}) {
  const [activeImage, setActiveImage] = useState(0);

  function changeImage(direction: -1 | 1) {
    setActiveImage((current) =>
      (current + direction + images.length) % images.length,
    );
  }

  const image = images[activeImage];

  return (
    <div className="relative min-h-44 overflow-hidden bg-white sm:min-h-64">
      <Image
        alt={image.alt}
        className="h-44 w-full object-contain transition-opacity duration-300 sm:h-64"
        height={1278}
        src={image.src}
        width={1286}
      />
      <button
        aria-label={`Previous ${label} image`}
        className="absolute top-1/2 left-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-black/15 bg-white/80 text-sm text-black backdrop-blur-sm transition-colors hover:bg-white"
        onClick={() => changeImage(-1)}
        type="button"
      >
        ←
      </button>
      <button
        aria-label={`Next ${label} image`}
        className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-black/15 bg-white/80 text-sm text-black backdrop-blur-sm transition-colors hover:bg-white"
        onClick={() => changeImage(1)}
        type="button"
      >
        →
      </button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((item, index) => (
          <button
            aria-label={`Show ${label} image ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${index === activeImage ? "w-6 bg-accent" : "w-1.5 bg-black/30"}`}
            key={item.src}
            onClick={() => setActiveImage(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

export function Shop() {
  const { t } = useLanguage();
  return (
    <section
      className="scroll-mt-20 border-b border-white/10 bg-surface px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
      id="shop"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-10 bg-accent" />
              ZONA merch
            </p>
            <h2 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.06em] text-foreground uppercase sm:text-7xl">
              {t("Wear the")}
              <span className="block text-accent">{t("after-hours.")}</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted sm:text-right">
            {t("The first ZONA collection is on its way.")}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {products.map((product) => (
            <article
              className="group relative min-w-0 overflow-hidden border border-white/10 bg-background p-2 transition-colors hover:border-accent/60 sm:p-4"
              key={product.name}
            >
              <div className="relative grid min-h-44 place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.16),transparent_40%),linear-gradient(145deg,#25262b,#0e0f11)] sm:min-h-64">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:2rem_2rem]" />
                {product.kind === "hoodie" ? (
                  <MerchCarousel images={hoodieImages} label={t("Hoodie")} />
                ) : product.kind === "shirt" ? (
                  <MerchCarousel images={tshirtImages} label={t("T-Shirt")} />
                ) : product.kind === "hat" ? (
                  <MerchCarousel images={hatImages} label={t("Hat")} />
                ) : (
                  <div className="relative min-h-44 overflow-hidden bg-white sm:min-h-64">
                    <Image
                      alt="ZONA black socks with logo and signature pattern"
                      className="h-44 w-full object-contain sm:h-64"
                      height={1254}
                      src="/images/zona-socks.png"
                      width={1254}
                    />
                  </div>
                )}
                <span className="absolute top-3 right-3 font-mono text-xs text-accent">
                  {product.code}
                </span>
                <span className="absolute bottom-3 left-3 border border-white/15 bg-black/30 px-2 py-1 text-[0.55rem] font-bold tracking-[0.16em] text-white/70 uppercase backdrop-blur-sm">
                  {t("Coming soon")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-3 sm:pt-4">
                <h3 className="text-sm font-semibold text-foreground sm:text-lg">{t(product.name)}</h3>
                <span className="text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                  ZONA / 001
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
