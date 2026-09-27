import { SectionHeading } from "@/components/ui/section-heading";

const details = [
  ["Capacity", "70"],
  ["Location", "UpTown"],
  ["Since", "2024"],
];

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-b border-white/10 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-10">
        <div className="relative min-h-112 overflow-hidden border border-white/10 bg-surface sm:min-h-136">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.3),transparent_4%),radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.13),transparent_18%),linear-gradient(135deg,#292a30_0%,#101114_68%)]" />
            <div className="absolute top-0 left-[22%] h-full w-px bg-white/15" />
            <div className="absolute top-0 left-[53%] h-full w-px bg-white/10" />
            <div className="absolute right-6 bottom-10 h-40 w-40 rounded-full border border-white/20" />
            <div className="absolute right-14 bottom-18 h-24 w-24 rounded-full border border-accent/60" />
            <div className="absolute right-[5.5rem] bottom-[6.5rem] h-2 w-2 rounded-full bg-accent shadow-[0_0_30px_8px_rgba(225,6,0,0.45)]" />
          </div>
          <p className="absolute right-5 bottom-5 text-[0.625rem] font-bold tracking-[0.22em] text-muted uppercase">
            Built for the after-hours
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <SectionHeading
            eyebrow="The ZONA story"
            title={
              <>
                This is not a club.
                <br />
                It is a <span className="text-accent">moment.</span>
              </>
            }
          />
          <p className="mt-8 max-w-xl text-base leading-8 text-muted sm:text-lg">
            ZONA brings together sound, light, and the people who know how to
            make a night last. Come early for the atmosphere. Stay late for what
            happens when the lights disappear.
          </p>
          <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {details.map(([label, value]) => (
              <div className="bg-background p-4 sm:p-5" key={label}>
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {value}
                </p>
                <p className="mt-1 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
