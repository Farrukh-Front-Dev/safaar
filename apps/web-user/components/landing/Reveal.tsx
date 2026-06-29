"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Landing bo'limlari uchun "scroll reveal" animatsiyasi (motion, cross-browser).
 * - Element ko'rinish maydoniga kirganda yumshoq fade + translateY bilan paydo bo'ladi.
 * - `viewport once` — bir marta animatsiya (har scroll'da takrorlanmaydi → optimal).
 * - `prefers-reduced-motion` — animatsiya o'chiriladi (a11y).
 *
 * Faqat marketing landing'da ishlatiladi; transaksion app sahifalari toza qoladi.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
