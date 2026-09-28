import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden border-b border-white/10 bg-background">
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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-24 pb-10 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.24em] text-accent uppercase sm:text-base">
              Own the night.
            </p>
            <h1 className="max-w-5xl text-7xl font-black leading-[0.78] tracking-[-0.095em] text-foreground uppercase sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem]">
              ZONA
            </h1>
            <p className="mt-5 text-xs font-bold tracking-[0.35em] text-muted uppercase sm:text-sm">
              Private club
            </p>
            <p className="mt-8 max-w-lg text-base leading-7 text-muted sm:text-lg">
              A private club for great music, late conversations, and nights
              that are only getting started.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-6 text-sm font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-[#ff201a] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                href="#reservations"
              >
                BOOK YOUR NIGHT
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 px-6 text-sm font-bold tracking-[0.1em] text-foreground uppercase transition-colors hover:border-foreground hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                href="#about"
              >
                Discover ZONA
              </a>
            </div>
          </div>

          <div className="border-l border-white/20 pl-5 lg:pb-2">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              After dark
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-foreground">
              Your night starts here.
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-foreground uppercase transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              href="#reservations"
            >
              Book your night
            </a>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-4 text-[0.6875rem] font-bold tracking-[0.2em] text-muted uppercase sm:mt-20">
          <span className="h-px flex-1 bg-white/15" />
          Scroll to enter
          <span className="h-px w-8 bg-white/15" />
        </div>
      </div>
    </section>
  );
}
