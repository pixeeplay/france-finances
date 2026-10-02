export default function ProfilLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
      {/* Profile header skeleton */}
      <header className="pt-4 px-4 flex flex-col border-b border-border bg-card/50 sticky top-0 z-40">
        {/* Row 1: Avatar + Pseudo + Auth */}
        <div className="flex items-center gap-3 w-full mb-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
          {/* Name + status */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          {/* Auth button */}
          <div className="h-7 w-20 rounded-lg bg-muted shrink-0" />
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-1 p-1 bg-card/50 rounded-lg mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-8 rounded-xl bg-muted" />
          ))}
        </div>
      </header>

      {/* Content skeleton */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* XP bar skeleton */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-2 w-full rounded-full bg-muted" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 space-y-2"
            >
              <div className="h-6 w-12 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Achievements skeleton */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-12 rounded-lg bg-muted mx-auto" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
