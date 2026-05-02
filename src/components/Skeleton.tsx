"use client";

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-t-border/60 animate-pulse rounded-xl ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-t-border bg-t-surface rounded-2xl border p-3">
            <Bone className="mb-2 h-3 w-16" />
            <Bone className="h-5 w-20" />
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <Bone className="h-2 w-full" />
      {/* Transaction list */}
      <div className="space-y-3">
        <Bone className="h-3 w-32" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-t-border bg-t-surface flex items-center gap-3 rounded-2xl border p-4"
          >
            <Bone className="h-5 w-5 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-2 w-1/3" />
            </div>
            <Bone className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
