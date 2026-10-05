"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { UiIcon } from "@/components/icons/UiIcon";

export default function CategoryError({
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
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
      <UiIcon name="alert" size={40} className="text-danger" />
      <h2 className="text-lg font-bold">Oups, quelque chose a planté</h2>
      <p className="text-sm text-muted-foreground text-center">
        {error.digest ? `Erreur ${error.digest}` : "Une erreur inattendue est survenue."}
      </p>
      <button
        onClick={reset}
        className="rounded-xl py-3 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
