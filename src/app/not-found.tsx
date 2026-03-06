import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-6xl font-bold text-muted-foreground">404</div>
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Page introuvable
        </h2>
        <p className="text-muted-foreground text-sm">
          Cette page n&apos;existe pas ou a ete deplacee.
        </p>
      </div>
      <Link
        href="/jeu"
        className="rounded-xl py-3 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Jouer
      </Link>
    </div>
  );
}
