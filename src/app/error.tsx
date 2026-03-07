"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", {
      digest: error.digest,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-5xl">&#x26A0;&#xFE0F;</div>
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Oups, quelque chose a plante
        </h2>
        <p className="text-muted-foreground text-sm">
          {error.digest ? `Erreur ${error.digest}` : "Une erreur inattendue s'est produite."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl py-3 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Reessayer
      </button>
    </div>
  );
}
