import Link from "next/link";

export default function NotFound() {
  return (
    <div className="dark min-h-dvh flex items-center justify-center bg-background text-foreground px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm">
        <div className="relative">
          <span className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-muted-foreground to-muted-foreground/30">
            404
          </span>
          <span className="absolute -top-2 -right-4 text-4xl animate-bounce">
            &#x1FA9A;
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
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
          className="rounded-xl py-3.5 px-8 bg-primary text-white font-bold text-lg shadow-(--shadow-glow-green) hover:bg-primary/90 active:scale-95 transition-all"
        >
          Retour au jeu
        </Link>
      </div>
    </div>
  );
}
