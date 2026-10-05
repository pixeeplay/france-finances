import Link from "next/link";

/** Bandeau discret vers la section « projet de budget 2027 » de /chiffres. */
export function Budget2027Banner() {
  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/chiffres#budget-2027"
          className="group flex min-h-[44px] items-center justify-center gap-2 py-2 text-center text-sm text-foreground"
        >
          <span className="shrink-0 rounded border border-warning px-1.5 text-[10px] font-black uppercase tracking-wider text-warning">
            Projet
          </span>
          <span>
            <strong className="font-semibold">Budget 2027&nbsp;:</strong> ce que prévoit le projet
          </span>
          <span aria-hidden="true" className="text-warning transition-transform group-hover:translate-x-0.5">
            &#8594;
          </span>
        </Link>
      </div>
    </div>
  );
}
