"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks";
import { UiIcon } from "./icons/UiIcon";

/**
 * InstallBanner — shows a dismissible install prompt when the app is installable.
 * Only visible when the `beforeinstallprompt` event fires (PWA criteria met).
 */
export function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-50 max-w-md mx-auto px-3 pb-safe animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            Installer l&apos;app
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Acces rapide depuis l&apos;ecran d&apos;accueil
          </p>
        </div>
        <button
          onClick={promptInstall}
          className="shrink-0 min-h-[44px] px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors active:scale-95"
        >
          Installer
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer la banniere d'installation"
          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <UiIcon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
