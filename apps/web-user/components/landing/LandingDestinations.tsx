/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LandingDict } from "@/i18n/dictionaries";
import { placeholderPhoto } from "@/lib/images";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

/** Mashhur yo'nalishlar — 3D tilt rasm kartalari (hoverda yumshoq egiladi). */
export function LandingDestinations({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["destinations"];
}) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
          <p className="mt-2 text-slate-500">{dict.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {dict.cities.map((city) => (
            <CardContainer
              key={city.name}
              containerClassName="block py-0"
              className="w-full"
            >
              <CardBody className="h-auto w-full">
                <Link
                  href={`/${locale}/hotels`}
                  className="group relative block aspect-4/3 w-full overflow-hidden rounded-2xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <CardItem translateZ={40} className="!w-full">
                    <img
                      src={placeholderPhoto(`city-${city.name}`, 600, 450)}
                      alt={city.name}
                      loading="lazy"
                      className="aspect-4/3 w-full object-cover"
                    />
                  </CardItem>
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <CardItem
                    translateZ={70}
                    className="absolute inset-x-0 bottom-0 !w-full p-4 text-white"
                  >
                    <p className="text-lg font-bold">{city.name}</p>
                    <p className="text-sm text-white/80">{city.tagline}</p>
                  </CardItem>
                </Link>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
