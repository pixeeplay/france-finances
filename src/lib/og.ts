/**
 * Utilitaires partagés des images Open Graph (next/og, runtime edge).
 * Même direction artistique que le site : fond ardoise, serif éditoriale,
 * filets fins, couleur réservée au sens (garder / à revoir).
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_COLORS = {
  background: "#0F172A",
  card: "#1E293B",
  rule: "#334155",
  text: "#F8FAFC",
  muted: "#94A3B8",
  keep: "#10B981",
  cut: "#EF4444",
} as const;

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
};

/**
 * Charge une police Google Fonts (sous-ensemble limité au texte affiché).
 * Retourne null en cas d'échec : l'image retombe alors sur la police par défaut.
 */
async function loadGoogleFont(family: string, weight: 400 | 600, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { signal: AbortSignal.timeout(3000) })).text();
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1], { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Polices de l'OG : Source Serif 4 (titres, chiffres) + IBM Plex Mono (étiquettes). */
export async function loadOgFonts(text: string): Promise<OgFont[]> {
  const [serif, mono] = await Promise.all([
    loadGoogleFont("Source Serif 4", 600, text),
    loadGoogleFont("IBM Plex Mono", 400, text),
  ]);
  const fonts: OgFont[] = [];
  if (serif) fonts.push({ name: "Serif", data: serif, weight: 600, style: "normal" });
  if (mono) fonts.push({ name: "Mono", data: mono, weight: 400, style: "normal" });
  return fonts;
}

export const OG_SERIF = "Serif, Georgia, serif";
export const OG_MONO = "Mono, monospace";
