import type { ReactNode } from "react";

/**
 * Pictogrammes de catégorie (trait 24x24, currentColor).
 * Remplacent les emojis des cartes : un pictogramme par deck, mappé par `deckId`.
 * Décoratifs : toujours aria-hidden, le libellé est porté par le texte voisin.
 */

/** Drapeau européen stylisé : cadre + couronne de 12 étoiles pleines. */
const EU_STARS: ReactNode = (
  <>
    <rect x="1.5" y="3.5" width="21" height="17" rx="2.5" />
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const cx = 12 + Math.cos(angle) * 5.3;
      const cy = 12 + Math.sin(angle) * 5.3;
      return <circle key={i} cx={cx.toFixed(2)} cy={cy.toFixed(2)} r="1.05" fill="currentColor" stroke="none" />;
    })}
  </>
);

const ICONS: Record<string, ReactNode> = {
  // Défense : épées croisées
  defense: (
    <>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
      <path d="M5 14l4 4" />
      <path d="M7 17l-3 3" />
      <path d="M3 19l2 2" />
    </>
  ),
  // Énergie : éclair
  energie: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  // Santé : croix médicale
  sante: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />,
  // Social : deux personnes
  social: (
    <>
      <circle cx="9" cy="7" r="3.5" />
      <path d="M2.5 21v-1.5A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5V21" />
      <path d="M16 3.3a3.5 3.5 0 0 1 0 7.4" />
      <path d="M18.5 15.2a4.5 4.5 0 0 1 3 4.3V21" />
    </>
  ),
  // Éducation : livre ouvert
  education: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  // Sécurité & Justice : balance
  securite: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      <path d="m2 16 3-8 3 8c-.9.6-1.9 1-3 1s-2.1-.4-3-1z" />
      <path d="m16 16 3-8 3 8c-.9.6-1.9 1-3 1s-2.1-.4-3-1z" />
    </>
  ),
  // Fonctionnement de l'État : édifice à colonnes
  etat: (
    <>
      <path d="M12 3 21 8H3z" />
      <path d="M5 11v7" />
      <path d="M9.67 11v7" />
      <path d="M14.33 11v7" />
      <path d="M19 11v7" />
      <path d="M3 21h18" />
    </>
  ),
  // Culture, Sport & Transports : billet
  culture: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M14 5v2" />
      <path d="M14 11v2" />
      <path d="M14 17v2" />
    </>
  ),
  // Agriculture : épi de blé
  agriculture: (
    <>
      <path d="M12 22V5" />
      <path d="M12 8C10 7.2 9 5.5 9 3.5c2 .8 3 2.5 3 4.5z" />
      <path d="M12 8c2-.8 3-2.5 3-4.5-2 .8-3 2.5-3 4.5z" />
      <path d="M12 13c-2.5-.5-4-2.3-4-4.5 2.5.5 4 2.3 4 4.5z" />
      <path d="M12 13c2.5-.5 4-2.3 4-4.5-2.5.5-4 2.3-4 4.5z" />
      <path d="M12 18c-2.5-.5-4-2.3-4-4.5 2.5.5 4 2.3 4 4.5z" />
      <path d="M12 18c2.5-.5 4-2.3 4-4.5-2.5.5-4 2.3-4 4.5z" />
    </>
  ),
  // Logement & Territoire : maison
  logement: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v12h14V9" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  // Immigration & Asile : passeport
  immigration: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="10" r="3.5" />
      <path d="M8.5 10h7" />
      <path d="M9 17h6" />
    </>
  ),
  // Numérique & Innovation : puce
  numerique: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  // Recettes de l'État : pièces
  recettes: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M18.1 10.4A6 6 0 1 1 10.3 18" />
      <path d="M7 6h1v4" />
      <path d="m16.7 13.9.7.7-2.8 2.8" />
    </>
  ),
  // Emploi & Compétitivité : mallette
  emploi: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </>
  ),
  // Environnement & Climat : feuille
  environnement: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-3" />
    </>
  ),
  // Collectivités : repère géographique
  collectivites: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  // La France dans l'Europe : drapeau européen
  "france-europe": EU_STARS,
  // Zombies budgétaires : fantôme
  zombies: (
    <>
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
      <path d="M9 10h.01M15 10h.01" />
    </>
  ),
  // Guerre en Ukraine : drapeau (neutre)
  ukraine: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </>
  ),
};

/** Pictogramme générique (barres) pour un deck inconnu ou le mode aléatoire. */
const FALLBACK_ICON: ReactNode = (
  <>
    <path d="M3 21h18" />
    <path d="M6 17V9" />
    <path d="M12 17V4" />
    <path d="M18 17v-5" />
  </>
);

/** Identifiants de deck disposant d'un pictogramme dédié. */
export const CATEGORY_ICON_IDS = Object.keys(ICONS);

export function hasCategoryIcon(deckId: string): boolean {
  return Object.prototype.hasOwnProperty.call(ICONS, deckId);
}

interface CategoryIconProps {
  deckId: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CategoryIcon({ deckId, size = 24, strokeWidth = 1.6, className }: CategoryIconProps) {
  const content = hasCategoryIcon(deckId) ? ICONS[deckId] : FALLBACK_ICON;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-category-icon={deckId}
      className={className}
    >
      {content}
    </svg>
  );
}
