import { Info } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Tizimga kirish
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Hamkor sifatida kirish uchun telefon raqamingizni kiriting.
        </p>
      </div>

      <div
        role="status"
        className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-900 dark:bg-brand-900/30 dark:text-brand-200"
      >
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700 dark:text-brand-300"
          aria-hidden
        />
        <p>
          <strong>Demo rejim:</strong> istalgan O'zbekiston raqami va istalgan 6
          raqamli kod bilan kirasiz.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
