import Link from "next/link";

export default function NotFound() {
  return (
    <div className="dark min-h-dvh flex items-center justify-center bg-background text-foreground px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="kicker text-muted-foreground">Erreur</span>
          <span className="numeral text-8xl text-muted-foreground">
            404
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Page introuvable
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Cette page a été tronçonnée ou n&apos;a jamais existé.
            <br />
            Pas de panique, le budget est intact.
          </p>
        </div>
        <Link
          href="/jeu"
          className="inline-flex items-center min-h-[44px] rounded-2xl py-3 px-8 bg-brand text-white font-heading font-bold hover:bg-brand-hover transition-colors"
        >
          Retour au jeu
        </Link>
      </div>
    </div>
  );
}
