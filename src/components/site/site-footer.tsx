const contactDetails = [
  { label: "Phone", value: "+389 78 533 677", href: "tel:+38978533677" },
  { label: "Address", value: "Којник 8, Велес", href: undefined },
];

const hours = [
  ["Monday — Thursday", "13:00 — 23:00"],
  ["Friday — Sunday", "13:00 — 00:00"],
];

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-20 pb-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <a
          aria-label="Open ZONA location in Google Maps"
          className="group relative min-h-80 overflow-hidden border border-white/10 bg-surface p-6 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
          href="https://maps.app.goo.gl/GEbC9VeWfDoKhPNQ9"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div aria-hidden="true" className="absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_0%,transparent_47%,rgba(255,255,255,0.1)_47.2%,rgba(255,255,255,0.1)_48%,transparent_48.2%),linear-gradient(42deg,transparent_0%,transparent_41%,rgba(255,255,255,0.08)_41.2%,rgba(255,255,255,0.08)_42%,transparent_42.2%)]" />
            <div className="absolute top-[22%] left-[17%] h-20 w-px rotate-[34deg] bg-white/30" />
            <div className="absolute right-[19%] bottom-[17%] h-32 w-px -rotate-[47deg] bg-white/20" />
            <div className="absolute top-[46%] left-[49%] h-4 w-4 rounded-full bg-accent shadow-[0_0_0_8px_rgba(225,6,0,0.16),0_0_45px_10px_rgba(225,6,0,0.35)]" />
          </div>
          <div className="relative flex h-full flex-col justify-between">
            <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">
              Find ZONA
            </p>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                Којник 8, Велес
              </p>
              <p className="mt-2 text-sm text-muted">
                ZONA, Велес
              </p>
            </div>
          </div>
        </a>

        <div className="grid content-start gap-10 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              Contact
            </p>
            <dl className="mt-5 space-y-5">
              {contactDetails.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                    {detail.label}
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
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              Opening hours
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              {hours.map(([day, time]) => (
                <div
                  className="flex justify-between gap-5 border-b border-white/10 pb-3"
                  key={day}
                >
                  <dt className="text-muted">{day}</dt>
                  <dd className="text-right text-foreground">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-5 py-7 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} ZONA. All nights reserved.</p>
        <div className="flex gap-5">
          <a className="hover:text-foreground" href="https://www.instagram.com/zona_privateclub/" rel="noopener noreferrer" target="_blank">
            Instagram
          </a>
          <a className="hover:text-foreground" href="https://www.facebook.com/p/ZONA-PrivateClub-61555272743261/" rel="noopener noreferrer" target="_blank">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
