"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  collapsed: boolean;
  subItems?: {
    label: string;
    href: string;
    icon: ReactNode;
    badge?: number;
  }[];
}

export default function SidebarItem({
  label,
  href,
  icon,
  badge,
  collapsed,
  subItems,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const hasChildren = subItems && subItems.length > 0;
  const isChildActive = hasChildren && subItems.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
            "transition-all duration-150 cursor-pointer",
            isChildActive
              ? "text-white bg-white/8"
              : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
          )}
        >
          <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold bg-[var(--danger)] text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
              <ChevronRight
                size={14}
                className={cn(
                  "text-[var(--sidebar-text)] transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            </>
          )}
        </button>

        {!collapsed && isOpen && (
          <div className="ml-4 pl-4 border-l border-white/10 mt-1 flex flex-col gap-0.5">
            {subItems.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
                    "transition-all duration-150",
                    childActive
                      ? "text-[var(--accent)] bg-[var(--sidebar-active)] font-medium"
                      : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
                  )}
                >
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-70">{child.icon}</span>
                  <span className="flex-1">{child.label}</span>
                  {child.badge !== undefined && child.badge > 0 && (
                    <span className="text-[10px] font-bold bg-[var(--danger)] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
        "transition-all duration-150",
        isActive
          ? "text-white bg-[var(--sidebar-active)] text-[var(--accent)]"
          : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
      )}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="text-[10px] font-bold bg-[var(--danger)] text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
