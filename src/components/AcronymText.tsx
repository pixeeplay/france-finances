"use client";

import { useState, useCallback, useRef, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { findLexiconMatches, getLexiconEntry } from "@/lib/lexique";

interface AcronymTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Ouvre « Voir le lexique » dans un nouvel onglet (dans le jeu, pour ne pas
   * interrompre la partie).
   */
  lexiconInNewTab?: boolean;
}

const TOOLTIP_MAX_WIDTH = 280;
/** En dessous de cette distance au haut de l'écran, l'infobulle s'ouvre sous le mot. */
const TOOLTIP_MIN_SPACE_ABOVE = 160;

type Part =
  | { type: "text"; value: string }
  | { type: "term"; value: string; key: string; before?: string; after?: string };

/** Découpe le texte en morceaux : texte simple et sigles/termes du lexique. */
function splitParts(text: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  for (const match of findLexiconMatches(text)) {
    if (match.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    parts.push({ type: "term", value: match.value, key: match.key });
    lastIndex = match.index + match.value.length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });

  // La ponctuation ouvrante/fermante collée au sigle (« ( », « ) », « , », « . »)
  // reste avec lui : pas de retour à la ligne entre « ( » et le sigle.
  parts.forEach((part, i) => {
    if (part.type !== "term") return;
    const prev = parts[i - 1];
    if (prev?.type === "text") {
      const lead = /[([« ]+$/.exec(prev.value)?.[0];
      if (lead) {
        part.before = lead;
        prev.value = prev.value.slice(0, -lead.length);
      }
    }
    const next = parts[i + 1];
    if (next?.type === "text") {
      const trail = /^[)\]» ,.;:!?]+/.exec(next.value)?.[0];
      if (trail) {
        part.after = trail;
        next.value = next.value.slice(trail.length);
      }
    }
  });
  return parts;
}

/**
 * Affiche un texte en soulignant les sigles et termes du lexique : un appui
 * (ou le survol à la souris) ouvre une infobulle avec la définition et un
 * lien vers la page /lexique. L'infobulle passe par un portail pour sortir
 * des conteneurs en overflow:hidden.
 */
export function AcronymText({ text, className, style, lexiconInNewTab = false }: AcronymTextProps) {
  const [active, setActive] = useState<{
    /** Position du déclencheur dans le texte */
    index: number;
    key: string;
    top: number;
    left: number;
    /** Décalage de la flèche par rapport au centre de l'infobulle (bord d'écran) */
    arrowOffset: number;
    /** Infobulle sous le mot quand il n'y a pas la place au-dessus */
    below: boolean;
    /** Le déclencheur est dans un conteneur .dark (ex. le jeu, sombre même en thème clair) */
    dark: boolean;
  } | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Au survol, on laisse le temps de passer du mot à l'infobulle (lien « Voir le lexique »).
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), 200);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  const show = useCallback(
    (index: number, key: string, btn: HTMLElement) => {
      cancelClose();
      const rect = btn.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      // Garde l'infobulle dans l'écran, avec 8 px de marge de chaque côté.
      const half = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - 16) / 2;
      const left = Math.min(Math.max(center, 8 + half), window.innerWidth - 8 - half);
      const below = rect.top < TOOLTIP_MIN_SPACE_ABOVE;
      setActive({
        index,
        key,
        // L'infobulle est en position fixe : coordonnées de la fenêtre, sans le défilement.
        top: below ? rect.bottom + 8 : rect.top - 8,
        left,
        arrowOffset: center - left,
        below,
        dark: btn.closest(".dark") !== null,
      });
    },
    [cancelClose],
  );

  const handleClick = useCallback(
    (index: number, key: string, btn: HTMLButtonElement) => {
      if (active?.index === index) {
        setActive(null);
        return;
      }
      show(index, key, btn);
    },
    [active?.index, show],
  );

  // Fermeture au clic en dehors de l'infobulle, ou au défilement (position fixe)
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current?.contains(e.target as Node)) return;
      setActive(null);
    };
    const close = () => setActive(null);
    document.addEventListener("click", handler, true);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", handler, true);
      window.removeEventListener("scroll", close, true);
    };
  }, [active]);

  const parts = splitParts(text);

  if (parts.every((p) => p.type === "text")) {
    return <span className={className} style={style}>{text}</span>;
  }

  const entry = active ? getLexiconEntry(active.key) : null;
  const finePointer = () => window.matchMedia("(pointer: fine)").matches;

  return (
    <span className={className} style={style}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }
        return (
          <span key={i} className="whitespace-nowrap">
            {part.before}
            <button
              type="button"
              aria-expanded={active?.index === i}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClick(i, part.key, e.currentTarget);
              }}
              onMouseEnter={(e) => {
                // Survol seulement avec un pointeur précis (souris)
                if (finePointer()) show(i, part.key, e.currentTarget);
              }}
              onMouseLeave={() => {
                if (finePointer()) scheduleClose();
              }}
              className="text-foreground font-medium border-b border-dotted border-muted-foreground hover:border-foreground transition-colors cursor-help"
            >
              {part.value}
            </button>
            {part.after}
          </span>
        );
      })}

      {active &&
        entry &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={cancelClose}
            onMouseLeave={() => {
              if (finePointer()) scheduleClose();
            }}
            className={`${active.dark ? "dark " : ""}fixed z-[9999] flex flex-col gap-1 px-3 py-2 bg-card border border-border rounded-xl shadow-(--shadow-card) text-xs text-foreground font-medium text-wrap leading-snug pointer-events-auto`}
            style={{
              top: active.top,
              left: active.left,
              maxWidth: `min(${TOOLTIP_MAX_WIDTH}px, calc(100vw - 16px))`,
              transform: active.below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            }}
          >
            <span>
              <span className="font-heading font-bold text-foreground">{entry.key}</span>
              {entry.expansion ? <> — {entry.expansion}</> : null}
            </span>
            {entry.definition && entry.definition !== entry.expansion ? (
              <span className="font-normal text-muted-foreground">{entry.definition}</span>
            ) : null}
            <a
              href={`/lexique#${entry.slug}`}
              {...(lexiconInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center min-h-[32px] font-heading font-bold text-brand-fg dark:text-info underline underline-offset-2"
            >
              Voir le lexique
              {lexiconInNewTab ? <span className="sr-only"> (nouvel onglet)</span> : null}
            </a>
            <span
              aria-hidden="true"
              className={`absolute left-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent ${
                active.below ? "bottom-full border-b-[6px] border-b-border" : "top-full border-t-[6px] border-t-border"
              }`}
              style={{ transform: `translateX(calc(-50% + ${active.arrowOffset}px))` }}
            />
          </span>,
          document.body,
        )}
    </span>
  );
}
