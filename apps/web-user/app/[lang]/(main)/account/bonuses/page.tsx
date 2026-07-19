import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { api } from "@/lib/api";
import { formatSum } from "@/lib/money";
import { Card, CardBody } from "@/components/ui/Card";
import type { BonusView } from "@/types/view";

export default async function AccountBonusesPage({
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
      `/${locale}/login?next=${encodeURIComponent(`/${locale}/account/bonuses`)}`,
    );
  }

  const dict = await getDictionary(locale, "account");
  const bonuses: BonusView | null = await api.users.getBonuses({ token: session.accessToken }).catch(() => null);

  const balanceSum = bonuses?.balanceSum ?? 0;
  const entries = bonuses?.entries ?? [];

  function formatDate(value: string): string {
    const ts = Date.parse(value);
    return Number.isFinite(ts)
      ? new Date(ts).toLocaleDateString("uz-UZ")
      : value;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">
            {dict.bonuses.balance}
          </span>
          <span className="text-3xl font-bold tracking-tight text-primary-600">
            {formatSum(balanceSum)}
          </span>
        </CardBody>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">{dict.bonuses.empty}</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">{dict.bonuses.history}</h2>
            <ul className="flex flex-col divide-y divide-black/5">
              {entries.map((entry) => {
                const positive = entry.amountSum >= 0;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {entry.reason}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <span
                      className={
                        positive
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {positive ? "+" : "−"}
                      {formatSum(Math.abs(entry.amountSum))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
