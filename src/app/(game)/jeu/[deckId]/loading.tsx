export default function DeckSessionLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 animate-pulse">
      {/* Progress bar skeleton */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-2 w-full rounded-full bg-card" />
      </div>

      {/* Card skeleton */}
      <div className="w-full max-w-[320px] aspect-[3/4] rounded-2xl bg-card border-2 border-border flex flex-col p-6 gap-4">
        {/* Category badge */}
        <div className="h-6 w-24 rounded-full bg-muted" />
        {/* Title */}
        <div className="h-6 w-3/4 rounded bg-muted" />
        {/* Amount */}
        <div className="h-10 w-1/2 rounded bg-muted" />
        {/* Description lines */}
        <div className="space-y-2 mt-auto">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-4/6 rounded bg-muted" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-6 mt-8">
        <div className="w-14 h-14 rounded-full bg-card border-2 border-border" />
        <div className="w-14 h-14 rounded-full bg-card border-2 border-border" />
      </div>
    </div>
  );
}
