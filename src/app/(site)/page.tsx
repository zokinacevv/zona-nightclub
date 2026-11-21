import { About } from "@/components/site/about";
import { Gallery } from "@/components/site/gallery";
import { Hero } from "@/components/site/hero";
import { LocalBusinessSchema } from "@/components/site/local-business-schema";
import { Navbar } from "@/components/site/navbar";
import { ReservationCta } from "@/components/site/reservation-cta";
import { Shop } from "@/components/site/shop";
import { SiteFooter } from "@/components/site/site-footer";

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <LocalBusinessSchema />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <ReservationCta />
        <Shop />
      </main>
      <SiteFooter />
    </div>
  );
}
