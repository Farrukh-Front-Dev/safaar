"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  items: PillNavItem[];
  className?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
}

/**
 * ReactBits PillNav — Next.js'ga moslangan versiya.
 * Hover'da pastdan doira ko'tarilib pill'ni to'ldiradi (gsap animatsiya).
 * Faol sahifa pastdagi dot bilan belgilanadi.
 */
export function PillNav({
  items,
  className = "",
  baseColor = "#ffffff",
  pillColor = "#0f172a",
  hoveredPillTextColor = "#0f172a",
  pillTextColor,
}: PillNavProps) {
  const pathname = usePathname();
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const ease = "power3.out";

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0,
        );
        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0,
          );
        }
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0,
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }
    return () => window.removeEventListener("resize", layout);
  }, [items]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
    "--nav-h": "42px",
    "--pill-pad-x": "18px",
    "--pill-gap": "3px",
  } as React.CSSProperties;

  return (
    <nav aria-label="Asosiy menyu" className={className} style={cssVars}>
      <ul
        role="menubar"
        className="flex h-[var(--nav-h)] items-stretch gap-[var(--pill-gap)] rounded-full p-[3px]"
        style={{ background: "var(--base)" }}
      >
        {items.map((item, i) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} role="none" className="flex h-full">
              <Link
                role="menuitem"
                href={item.href}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative box-border inline-flex h-full cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-[var(--pill-pad-x)] text-sm font-semibold uppercase leading-none tracking-wide"
                style={{
                  background: "var(--pill-bg)",
                  color: "var(--pill-text)",
                }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
              >
                <span
                  className="pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
                  style={{
                    background: "var(--base)",
                    willChange: "transform",
                  }}
                  aria-hidden
                  ref={(el) => {
                    circleRefs.current[i] = el;
                  }}
                />
                <span className="label-stack relative z-[2] inline-block leading-none">
                  <span
                    className="pill-label relative z-[2] inline-block leading-none"
                    style={{ willChange: "transform" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                    style={{
                      color: "var(--hover-text)",
                      willChange: "transform, opacity",
                    }}
                    aria-hidden
                  >
                    {item.label}
                  </span>
                </span>
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 z-[4] h-2 w-2 -translate-x-1/2 rounded-full"
                    style={{ background: "var(--base)" }}
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PillNav;
