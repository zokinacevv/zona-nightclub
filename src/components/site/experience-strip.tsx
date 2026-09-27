const moments = [
  ["01", "Sound", "Set the mood"],
  ["02", "Energy", "Bring your people"],
  ["03", "Drinks", "Raise your glass"],
];

export function ExperienceStrip() {
  return (
    <section aria-label="The ZONA experience" className="border-b border-white/10 bg-surface">
      <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
        {moments.map(([number, label, value]) => (
          <div className="flex items-center gap-5 py-6 md:px-7 md:py-7 first:md:pl-0 last:md:pr-0" key={number}>
            <span className="font-mono text-xs text-accent">{number}</span>
            <div>
              <p className="text-[0.625rem] font-bold tracking-[0.18em] text-muted uppercase">{label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
