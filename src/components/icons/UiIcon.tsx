import type { ReactNode } from "react";

/**
 * Pictogrammes d'interface (trait 24x24, currentColor), dans le même dessin
 * que CategoryIcon. Remplacent les emojis décoratifs (onboarding, hauts faits,
 * familles d'archétypes). Décoratifs : toujours aria-hidden.
 * Pour garder / couper, utiliser ShieldIcon et ChainsawIcon.
 */
const PATHS = {
  // Cible : estimation juste, stratège
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  // Ampoule : série de bonnes réponses
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  // Histogramme
  chart: (
    <>
      <path d="M3 21h18" />
      <path d="M6 17v-6M11 17V7M16 17v-9M21 17v-4" />
    </>
  ),
  // Balance : équilibre
  balance: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      <path d="m2 16 3-8 3 8c-.9.6-1.9 1-3 1s-2.1-.4-3-1z" />
      <path d="m16 16 3-8 3 8c-.9.6-1.9 1-3 1s-2.1-.4-3-1z" />
    </>
  ),
  // Presse-papiers : audit
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 4V3h6v1" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  // Carte pliée : tour des catégories
  map: (
    <>
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  // Flamme : grosses coupes
  flame: <path d="M12 3c1 3 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.5 1 2.5 2 3 0-3 0-5.5.5-8z" />,
  // Médaille : fidélité
  medal: (
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M8.5 10.2 6 3h4l2 5 2-5h4l-2.5 7.2" />
      <path d="M12 12.5v5" />
    </>
  ),
  // Pile : nombre de cartes
  layers: (
    <>
      <path d="M12 3 2 8l10 5 10-5z" />
      <path d="m2 13 10 5 10-5" />
      <path d="m2 17.5 10 5 10-5" />
    </>
  ),
  // Éclair : rapidité
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  // Loupe : analyse
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  // Diamant : gros montants
  gem: (
    <>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M2 9h20M9 3l3 18 3-18" />
    </>
  ),
  // Coupe : collection complète
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 14v4M8 21h8M9 18h6" />
    </>
  ),
  // Cadenas : verrouillé
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  // Flèches croisées : externaliser
  swap: (
    <>
      <path d="M4 7h13l-3-3M20 17H7l3 3" />
    </>
  ),
  // Deux branches qui se rejoignent : fusionner
  merge: (
    <>
      <path d="M6 3v4a5 5 0 0 0 5 5h2a5 5 0 0 1 5 5v4" />
      <path d="M18 3v4a5 5 0 0 1-5 5" />
      <path d="m15 18 3 3 3-3" />
    </>
  ),
  // Croix : supprimer
  close: <path d="M6 6l12 12M18 6 6 18" />,
  // Tirelire / pièce : économies
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9a3 3 0 0 0-5 1.5c0 3 5 1.5 5 4.5a3 3 0 0 1-5 1M12 6.5v1.5M12 16v1.5" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type UiIconName = keyof typeof PATHS;

interface UiIconProps {
  name: UiIconName;
  size?: number;
  className?: string;
}

export function UiIcon({ name, size = 20, className }: UiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
