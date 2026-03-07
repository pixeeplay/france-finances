"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ACRONYMS } from "@/data/acronyms";

// Build a pattern that matches any known acronym as a whole word
const acronymKeys = Object.keys(ACRONYMS).sort((a, b) => b.length - a.length);
const acronymPattern = `\\b(${acronymKeys.join("|")})\\b`;

interface AcronymTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with acronyms highlighted — tap to see definition.
 * Tooltip uses a portal to escape overflow:hidden containers.
 */
export function AcronymText({ text, className }: AcronymTextProps) {
  const [active, setActive] = useState<{
    key: string;
    top: number;
    left: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const handleClick = useCallback(
    (key: string, btn: HTMLButtonElement) => {
      if (active?.key === key) {
        setActive(null);
        return;
      }
      const rect = btn.getBoundingClientRect();
      setActive({
        key,
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
      });
    },
    [active?.key],
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

  // Split text into parts (text + acronym matches)
  const parts: Array<{ type: "text" | "acronym"; value: string }> = [];
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

  // If no acronyms found, render plain text
  if (parts.every((p) => p.type === "text")) {
    return <span className={className}>{text}</span>;
  }

  // Find the active acronym definition for the portal tooltip
  const activePart = active
    ? active.key.split("-").slice(0, -1).join("-")
    : null;
  const activeDefinition = activePart ? ACRONYMS[activePart] : null;

  return (
    <span className={className}>
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
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleClick(key, e.currentTarget);
            }}
            className="text-primary font-semibold border-b border-dashed border-primary/40 hover:border-primary transition-colors cursor-help"
          >
            {part.value}
          </button>
        );
      })}

      {/* Portal tooltip — rendered at body level to escape overflow:hidden */}
      {active &&
        activeDefinition &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tooltipRef}
            className="fixed z-[9999] px-3 py-2 bg-card border border-primary/30 rounded-lg shadow-xl text-xs text-foreground font-medium max-w-[250px] text-wrap leading-snug pointer-events-auto"
            style={{
              top: active.top - 8,
              left: active.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="font-bold text-primary">{activePart}</span>
            {" — "}
            {activeDefinition}
            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary/30" />
          </span>,
          document.body,
        )}
    </span>
  );
}
