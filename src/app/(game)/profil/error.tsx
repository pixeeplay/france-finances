"use client";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
      <p className="text-4xl">😵</p>
      <h2 className="text-lg font-bold">Impossible de charger le profil</h2>
      <p className="text-sm text-muted-foreground text-center">
        {error.message || "Une erreur inattendue est survenue."}
      </p>
      <button
        onClick={reset}
        className="rounded-xl py-3 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Reessayer
      </button>
    </div>
  );
}
