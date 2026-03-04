import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatStrip } from "@/components/landing/StatStrip";
import { landingFeatures, landingStats, landingSteps } from "@/lib/content/landing";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const ctaPoints = [
  "No account or credit card required",
  "Instant results every time",
  "Complete vehicle history & alerts"
];

export default function HomePage() {
  return (
    <div>
      <HeroSection
        title="PlateIntel"
        subtitle="Enter any Dutch license plate and instantly receive a complete, structured vehicle report — specs, road-legal status, inspection timeline, and active safety alerts."
      />
      <StatStrip items={landingStats} />
      <FeatureGrid items={landingFeatures} />
      <HowItWorks items={landingSteps} />

      {/* Premium CTA section */}
      <section className="overflow-hidden bg-brand-600">
        <div className="relative mx-auto max-w-5xl px-6 py-16">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />

          <div className="relative flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Ready to know your vehicle?
            </h2>
            <p className="max-w-md text-brand-200">
              Thousands of lookups happen every day. Join them — it takes three seconds.
            </p>

            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {ctaPoints.map((pt) => (
                <li key={pt} className="flex items-center gap-1.5 text-sm text-brand-200">
                  <CheckCircle className="h-3.5 w-3.5 text-brand-300" />
                  {pt}
                </li>
              ))}
            </ul>

            <Link
              href="/#plate"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition-all duration-200 hover:bg-brand-50 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start a free lookup
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
