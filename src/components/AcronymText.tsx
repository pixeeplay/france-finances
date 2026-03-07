"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
 */
export function AcronymText({ text, className }: AcronymTextProps) {
  const [activeAcronym, setActiveAcronym] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const handleClick = useCallback((acronym: string) => {
    setActiveAcronym((prev) => (prev === acronym ? null : acronym));
  }, []);

  // Close tooltip on outside click
  useEffect(() => {
    if (!activeAcronym) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveAcronym(null);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [activeAcronym]);

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

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }

        const definition = ACRONYMS[part.value];
        const isActive = activeAcronym === `${part.value}-${i}`;
        const key = `${part.value}-${i}`;

        return (
          <span key={i} className="relative inline">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(key);
              }}
              className="text-primary font-semibold border-b border-dashed border-primary/40 hover:border-primary transition-colors cursor-help"
            >
              {part.value}
            </button>
            {isActive && definition && (
              <span
                ref={tooltipRef}
                className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-card border border-primary/30 rounded-lg shadow-xl text-xs text-foreground font-medium whitespace-nowrap max-w-[250px] text-wrap leading-snug"
              >
                <span className="font-bold text-primary">{part.value}</span>
                {" — "}
                {definition}
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary/30" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
