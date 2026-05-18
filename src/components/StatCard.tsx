import type { ReactNode } from "react";

export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-vault-muted">{label}</span>
        <span className="text-vault-cyan">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
