import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/landing/Reveal";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingDestinations } from "@/components/landing/LandingDestinations";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingCta } from "@/components/landing/LandingCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang, "landing");
  return { title: dict.hero.title, description: dict.hero.subtitle };
}

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const dict = await getDictionary(locale, "landing");

  return (
    <main className="flex flex-1 flex-col">
      <LandingHero locale={locale} dict={dict.hero} />
      <LandingStats dict={dict.stats} />
      <Reveal>
        <LandingHowItWorks dict={dict.how} />
      </Reveal>
      <Reveal>
        <LandingDestinations locale={locale} dict={dict.destinations} />
      </Reveal>
      <Reveal>
        <LandingFeatures dict={dict.features} />
      </Reveal>
      <Reveal>
        <LandingTestimonials dict={dict.testimonials} />
      </Reveal>
      <Reveal>
        <LandingCta locale={locale} dict={dict.cta} />
      </Reveal>
    </main>
  );
}
