"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks";

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
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-50 truncate">
            Installer l&apos;app
          </p>
          <p className="text-xs text-slate-400 truncate">
            Acces rapide depuis l&apos;ecran d&apos;accueil
          </p>
        </div>
        <button
          onClick={promptInstall}
          className="shrink-0 min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-colors active:scale-95"
        >
          Installer
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer la banniere d'installation"
          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span aria-hidden="true">&#x2715;</span>
        </button>
      </div>
    </div>
  );
}
