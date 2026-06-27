"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email va parolni kiriting");
      return;
    }

    setLoading(true);
    // Mock login
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("2fa");
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("6 xonali kodni kiriting");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] mb-4 shadow-lg shadow-[var(--accent)]/20">
          <Shield className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-white">UzBron Admin</h1>
        <p className="text-white/50 text-sm mt-1">Boshqaruv paneliga kirish</p>
      </div>

      {/* Card */}
      <div className="bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 shadow-2xl">
        {step === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uzbron.uz"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-5">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent)]/10 mb-3">
                <Shield className="text-[var(--accent)]" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-white">Ikki bosqichli tasdiqlash</h2>
              <p className="text-white/50 text-sm mt-1">
                Google Authenticator ilovasidagi 6 xonali kodni kiriting
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40 transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Tasdiqlash"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="text-sm text-white/40 hover:text-white/70 transition-colors text-center cursor-pointer"
            >
              ← Orqaga qaytish
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-white/20 text-xs mt-6">
        © 2026 UzBron.uz — Barcha huquqlar himoyalangan
      </p>
    </div>
  );
}
