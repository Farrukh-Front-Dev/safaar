import Link from "next/link";
import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-brand-700">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Sahifa topilmadi
      </h1>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan. Quyidagi tugma
        orqali bosh sahifaga qayting.
      </p>
      <Link href="/">
        <Button>Bosh sahifaga qaytish</Button>
      </Link>
    </div>
  );
}
