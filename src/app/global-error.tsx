"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ backgroundColor: "#0F172A", color: "#F8FAFC", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>&#x26A0;&#xFE0F;</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Erreur critique</h2>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>L&apos;application a rencontre une erreur inattendue.</p>
          <button
            onClick={reset}
            style={{ borderRadius: "0.75rem", padding: "0.75rem 1.5rem", backgroundColor: "#10B981", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
