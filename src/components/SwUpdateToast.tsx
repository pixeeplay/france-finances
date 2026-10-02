"use client";

import { useState, useEffect } from "react";

/**
 * SwUpdateToast — listens for service worker controller change and shows
 * a small toast at the bottom prompting the user to refresh.
 */
export function SwUpdateToast() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // First visit: the SW takes control (clientsClaim) without any previous version,
    // so there is nothing to refresh. Only a replaced controller is a real update.
    const sw = navigator.serviceWorker;
    let hadController = sw.controller !== null;

    function handleControllerChange() {
      if (hadController) setShowToast(true);
      hadController = true;
    }

    sw.addEventListener("controllerchange", handleControllerChange);

    return () => {
      sw.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 z-[200] mx-auto max-w-sm animate-slide-in-bottom"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-2xl">
        <p className="text-sm font-medium text-foreground">
          Nouvelle version disponible
        </p>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90 min-h-[36px]"
        >
          Actualiser
        </button>
      </div>
    </div>
  );
}
