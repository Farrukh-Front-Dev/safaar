/**
 * Backend foydalanuvchi (`/me`), bonus va sevimli javoblarini front
 * view-model'ga aylantiruvchi adapterlar.
 *
 * Backend `UserRecord` `snake_case` qaytaradi (`first_name`, `bonus_balance`...),
 * `camelizeKeys` orqali allaqachon `camelCase`ga o'tkazilgan. Bonus va pul
 * qiymatlari tiyin → so'm.
 */
import { tiyinToSum } from "@/lib/money";
import type {
  BonusEntryView,
  BonusView,
  FavoriteView,
  ProfileView,
} from "@/types/view";

interface RawUser {
  id?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  preferredLanguage?: string;
  bonusBalance?: number;
  createdAt?: string;
}

export function toProfileView(raw: RawUser): ProfileView {
  const firstName = raw.firstName ?? "";
  const lastName = raw.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    id: raw.id ?? "",
    phone: raw.phone ?? "",
    firstName,
    lastName,
    fullName: fullName || (raw.phone ?? ""),
    email: raw.email ?? "",
    bonusBalanceSum: tiyinToSum(raw.bonusBalance ?? 0),
    preferredLanguage: raw.preferredLanguage ?? "uz",
    status: raw.status ?? "active",
    createdAt: raw.createdAt ?? "",
  };
}

interface RawBonusEntry {
  id?: string;
  amount?: number;
  reason?: string;
  createdAt?: string;
}

interface RawBonuses {
  balance?: number;
  ledger?: RawBonusEntry[];
}

export function toBonusView(raw: RawBonuses): BonusView {
  return {
    balanceSum: tiyinToSum(raw.balance ?? 0),
    currency: "UZS",
    entries: (raw.ledger ?? []).map(toBonusEntryView),
  };
}

function toBonusEntryView(raw: RawBonusEntry): BonusEntryView {
  return {
    id: raw.id ?? "",
    amountSum: tiyinToSum(raw.amount ?? 0),
    reason: raw.reason ?? "",
    createdAt: raw.createdAt ?? "",
  };
}

interface RawFavorite {
  id?: string;
  targetType?: string;
  targetId?: string;
  createdAt?: string;
}

export function toFavoriteView(raw: RawFavorite): FavoriteView {
  return {
    id: raw.id ?? "",
    targetType: raw.targetType ?? "hotel",
    targetId: raw.targetId ?? "",
    createdAt: raw.createdAt ?? "",
  };
}
