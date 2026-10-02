import type { CSSProperties } from "react";
import { CategoryIcon } from "./CategoryIcon";
import { getDeckColor } from "@/lib/deckMeta";

interface CategoryBadgeProps {
  deckId: string;
  /** Côté de la pastille en px (le pictogramme en occupe ~55 %). */
  size?: number;
  className?: string;
  /** Pastille pleine et saturée (pictogramme blanc) plutôt que teintée */
  solid?: boolean;
}

/**
 * Pictogramme de catégorie dans une pastille colorée (couleur du deck).
 * Décoratif : aria-hidden, le libellé est porté par le texte voisin.
 */
export function CategoryBadge({ deckId, size = 40, className = "", solid = false }: CategoryBadgeProps) {
  const style = { "--cat": getDeckColor(deckId), width: size, height: size } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      style={style}
      data-category-badge={deckId}
      className={`${solid ? "cat-solid" : "cat-chip"} inline-flex shrink-0 items-center justify-center ${size >= 48 ? "rounded-2xl" : size >= 36 ? "rounded-xl" : "rounded-lg"} ${className}`}
    >
      <CategoryIcon deckId={deckId} size={Math.round(size * 0.55)} strokeWidth={1.9} />
    </span>
  );
}

/** Variable CSS `--cat` à poser sur un élément pour colorer `cat-text` / `cat-chip`. */
export function catStyle(deckId: string): CSSProperties {
  return { "--cat": getDeckColor(deckId) } as CSSProperties;
}
