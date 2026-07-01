import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { getFavorites } from "@/lib/api/users";
import { Card, CardBody } from "@/components/ui/Card";
import type { FavoriteView } from "@/types/view";

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const session = await getSession();
  if (!session) {
    redirect(
      `/${locale}/login?next=${encodeURIComponent(`/${locale}/account/favorites`)}`,
    );
  }

  const dict = await getDictionary(locale, "account");
  const favorites: FavoriteView[] = await getFavorites(session).catch(() => []);

  if (favorites.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">{dict.favorites.empty}</p>
        </CardBody>
      </Card>
    );
  }

  const typeLabels: Record<string, string> = {
    hotel: dict.favorites.hotel,
    bus: dict.favorites.bus,
  };

  return (
    <ul className="flex flex-col gap-4">
      {favorites.map((favorite) => {
        const typeLabel = typeLabels[favorite.targetType] ?? favorite.targetType;
        return (
          <li key={favorite.id}>
            <Card>
              <CardBody className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {typeLabel}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {favorite.targetId}
                </span>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
