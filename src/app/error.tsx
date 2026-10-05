"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { UiIcon } from "@/components/icons/UiIcon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[ErrorBoundary]", {
      digest: error.digest,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <UiIcon name="alert" size={48} className="text-danger" />
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Oups, quelque chose a planté
        </h2>
        <p className="text-muted-foreground text-sm">
          {error.digest ? `Erreur ${error.digest}` : "Une erreur inattendue s'est produite."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl py-3 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
