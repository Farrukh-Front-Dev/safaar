import Link from "next/link";
import { PhoneCall, ShieldCheck, HeartHandshake } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: CommonDict;
}) {
  const base = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/70 pt-12 pb-6 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link href={base} className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {dict.brand}
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {dict.footer.tagline}
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-600" />
                <span>+998 71 200 00 00 (24/7 Qo'llab-quvvatlash)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Xavfsiz va kafolatlangan bron qilish</span>
              </div>
            </div>
          </div>

          {/* Col 2: Destinations */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Mashhur Yo'nalishlar
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href={`${base}/hotels?city_id=toshkent`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Toshkent mehmonxonalari
                </Link>
              </li>
              <li>
                <Link href={`${base}/hotels?city_id=samarqand`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Samarqand mehmonxonalari
                </Link>
              </li>
              <li>
                <Link href={`${base}/hotels?city_id=buxoro`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Buxoro me'moriy mehmonxonalari
                </Link>
              </li>
              <li>
                <Link href={`${base}/hotels?city_id=xiva`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Xiva Ichan-Qal'a uylari
                </Link>
              </li>
              <li>
                <Link href={`${base}/dachas`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Chorvoq & Chimgon dachaları
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Xizmatlar & Toifalar
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href={`${base}/hotels`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.hotels}
                </Link>
              </li>
              <li>
                <Link href={`${base}/dachas`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.dachas}
                </Link>
              </li>
              <li>
                <Link href={`${base}/guesthouses`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.guesthouses}
                </Link>
              </li>
              <li>
                <Link href={`${base}/sanatoriums`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.sanatoriums}
                </Link>
              </li>
              <li>
                <Link href={`${base}/transport`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Avto ijarasi va Transfer
                </Link>
              </li>
              <li>
                <Link href={`${base}/restaurants`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  Restoranlar va Milliy Taomlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Partners */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Hamkorlik va Ma'lumot
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href={`${base}/about`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`${base}/help`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.help}
                </Link>
              </li>
              <li>
                <Link href={`${base}/terms`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {dict.nav.terms}
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="https://partner.safaar.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                >
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>Hamkorlar Kabineti (Partner)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-slate-800">
          <p>© {year} {dict.brand}. {dict.footer.rights}</p>
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <span>To'lov turlari:</span>
            {["Payme", "Click", "Uzcard", "Humo", "Visa"].map((payment) => (
              <span
                key={payment}
                className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                {payment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
