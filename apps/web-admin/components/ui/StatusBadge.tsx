interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, { label: string; color: string; bg: string }>;
}

export default function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, color: "var(--text-muted)", bg: "var(--bg-tertiary)" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
