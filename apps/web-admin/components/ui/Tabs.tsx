"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const current = tabs.find((t) => t.id === activeTab);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tab header */}
      <div className="flex items-center gap-0.5 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap",
              "border-b-2 -mb-px transition-all duration-150 cursor-pointer",
              tab.id === activeTab
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border)]"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  tab.id === activeTab
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-5 animate-fade-in" key={activeTab}>
        {current?.content}
      </div>
    </div>
  );
}
