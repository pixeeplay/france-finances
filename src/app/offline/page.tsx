"use client";

export default function OfflinePage() {
  return (
    <div className="dark min-h-dvh flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-sm text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">
          &#128268;
        </div>
        <h1 className="text-2xl font-bold">Hors connexion</h1>
        <p className="text-muted-foreground">
          Vous semblez ne pas avoir de connexion internet.
          Vérifiez votre réseau et réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90 min-h-[44px]"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
