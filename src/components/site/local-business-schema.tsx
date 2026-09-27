export function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name: "ZONA",
    description:
      "A destination for unforgettable nights and private celebrations.",
    telephone: "+38978533677",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Којник 8",
      addressLocality: "Veles",
      addressCountry: "MK",
    },
  };
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
