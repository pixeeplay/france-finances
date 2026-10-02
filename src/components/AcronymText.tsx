"use client";

import { useState, useCallback, useRef, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ACRONYMS } from "@/data/acronyms";

// Build a pattern that matches any known acronym as a whole word
const acronymKeys = Object.keys(ACRONYMS).sort((a, b) => b.length - a.length);
const acronymPattern = `\\b(${acronymKeys.join("|")})\\b`;

interface AcronymTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders text with acronyms highlighted — tap to see definition.
 * Tooltip uses a portal to escape overflow:hidden containers.
 */
export function AcronymText({ text, className, style }: AcronymTextProps) {
  const [active, setActive] = useState<{
    key: string;
    top: number;
    left: number;
    /** Le déclencheur est dans un conteneur .dark (ex. le jeu, sombre même en thème clair) */
    dark: boolean;
  } | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(
    (key: string, btn: HTMLElement) => {
      const rect = btn.getBoundingClientRect();
      setActive({
        key,
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
        dark: btn.closest(".dark") !== null,
      });
    },
    [],
  );

  const handleClick = useCallback(
    (key: string, btn: HTMLButtonElement) => {
      if (active?.key === key) {
        setActive(null);
        return;
      }
      show(key, btn);
    },
    [active?.key, show],
  );

  // Close tooltip on outside click
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current?.contains(e.target as Node)) return;
      setActive(null);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [active]);

  // Split text into parts (text + acronym matches). Opening/closing punctuation
  // touching an acronym ("(", ")", ",", ".") is kept with it so the line never
  // breaks between "(" and the acronym button.
  const parts: Array<{ type: "text" | "acronym"; value: string; before?: string; after?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(acronymPattern, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "acronym", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  parts.forEach((part, i) => {
    if (part.type !== "acronym" || !ACRONYMS[part.value]) return;
    const prev = parts[i - 1];
    if (prev?.type === "text") {
      const lead = /[([«\u00a0]+$/.exec(prev.value)?.[0];
      if (lead) {
        part.before = lead;
        prev.value = prev.value.slice(0, -lead.length);
      }
    }
    const next = parts[i + 1];
    if (next?.type === "text") {
      const trail = /^[)\]»\u00a0,.;:!?]+/.exec(next.value)?.[0];
      if (trail) {
        part.after = trail;
        next.value = next.value.slice(trail.length);
      }
    }
  });

  // If no acronyms found, render plain text
  if (parts.every((p) => p.type === "text")) {
    return <span className={className} style={style}>{text}</span>;
  }

  // Find the active acronym definition for the portal tooltip
  const activePart = active
    ? active.key.split("-").slice(0, -1).join("-")
    : null;
  const activeDefinition = activePart ? ACRONYMS[activePart] : null;

  return (
    <span className={className} style={style}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }

        const definition = ACRONYMS[part.value];
        if (!definition) {
          return <span key={i}>{part.value}</span>;
        }
        const key = `${part.value}-${i}`;

        return (
          <span key={i} className="whitespace-nowrap">
            {part.before}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClick(key, e.currentTarget);
              }}
              onMouseEnter={(e) => {
                // Hover only on devices with a fine pointer (desktop)
                if (window.matchMedia("(pointer: fine)").matches) {
                  show(key, e.currentTarget);
                }
              }}
              onMouseLeave={() => {
                if (window.matchMedia("(pointer: fine)").matches) {
                  setActive(null);
                }
              }}
              className="text-foreground font-medium border-b border-dotted border-muted-foreground hover:border-foreground transition-colors cursor-help"
            >
              {part.value}
            </button>
            {part.after}
          </span>
        );
      })}

      {/* Portal tooltip — rendered at body level to escape overflow:hidden */}
      {active &&
        activeDefinition &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tooltipRef}
            className={`${active.dark ? "dark " : ""}fixed z-[9999] px-3 py-2 bg-card border border-border rounded-xl shadow-(--shadow-card) text-xs text-foreground font-medium max-w-[250px] text-wrap leading-snug pointer-events-auto`}
            style={{
              top: active.top - 8,
              left: active.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="font-mono font-medium text-foreground">{activePart}</span>
            {" — "}
            {activeDefinition}
            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
          </span>,
          document.body,
        )}
    </span>
  );
}
