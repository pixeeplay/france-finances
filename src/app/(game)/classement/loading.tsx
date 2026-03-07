export default function ClassementLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background/90 border-b border-border">
        <div className="h-7 w-36 rounded-md bg-muted" />
      </header>

      {/* Profile card skeleton */}
      <div className="px-4 py-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="px-4 py-3">
        <div className="flex h-10 items-center justify-center rounded-lg bg-card p-1 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-full rounded-md bg-muted" />
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div className="flex-1 px-4 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
            <div className="h-5 w-14 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
