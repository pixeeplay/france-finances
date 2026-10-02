/**
 * Briques partagées des images Open Graph (next/og, runtime edge).
 *
 * Même identité que le site : fond ardoise #0F172A, Outfit très grasse,
 * titres en bleu vif, montants en rouge, pastilles de catégorie colorées,
 * bouclier (garder) et tronçonneuse (à revoir). Format 1200 x 630, pensé
 * pour rester lisible en vignette : peu d'éléments, gros caractères.
 *
 * Les polices sont livrées avec le code (src/assets/fonts, licence OFL) :
 * aucune requête réseau, rendu identique en local et en production.
 */
import { Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { CHAINSAW_PATHS, CHAINSAW_VIEWBOX } from "@/components/icons/chainsawPaths";
import { getDeckColor } from "@/lib/deckMeta";
import { lighten, withAlpha } from "@/lib/ogHelpers";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_COLORS = {
  background: "#0F172A",
  card: "#1E293B",
  rule: "#334155",
  text: "#F8FAFC",
  muted: "#CBD5E1",
  subtle: "#94A3B8",
  /** Bleu vif des grands titres (--brand-fg en thème sombre) */
  title: "#5B84FF",
  /** Bleu plein des boutons (--brand) */
  brand: "#0A33B0",
  /** Rouge des montants et de « à revoir » (--danger en thème sombre) */
  amount: "#F87171",
  cut: "#EF4444",
  keep: "#10B981",
  keepLight: "#34D399",
} as const;

export const OG_FONT_FAMILY = "Outfit";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 600 | 800 | 900;
  style: "normal";
};

let fontsPromise: Promise<OgFont[]> | null = null;

async function loadFont(url: URL, weight: OgFont["weight"]): Promise<OgFont> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Police OG introuvable : ${url.pathname}`);
  return { name: OG_FONT_FAMILY, data: await res.arrayBuffer(), weight, style: "normal" };
}

/** Outfit 600 (texte courant), 800 (titres), 900 (chiffres-clés). Chargée une fois par instance. */
export function loadOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    loadFont(new URL("../assets/fonts/Outfit-SemiBold.ttf", import.meta.url), 600),
    loadFont(new URL("../assets/fonts/Outfit-ExtraBold.ttf", import.meta.url), 800),
    loadFont(new URL("../assets/fonts/Outfit-Black.ttf", import.meta.url), 900),
  ]).catch((error: unknown) => {
    fontsPromise = null;
    throw error;
  });
  return fontsPromise;
}

/** Options communes de ImageResponse (taille + polices). */
export async function ogImageOptions() {
  return { ...OG_SIZE, fonts: await loadOgFonts() };
}

// === Pictogrammes ===

/** Drapeau tricolore arrondi (mêmes teintes que public/france.svg). */
export function OgFlag({ size }: { size: number }) {
  const height = Math.round(size * 0.66);
  const radius = Math.round(size * 0.12);
  return (
    <div style={{ display: "flex", width: size, height, borderRadius: radius, overflow: "hidden" }}>
      <div style={{ display: "flex", flex: 1, backgroundColor: "#41479B" }} />
      <div style={{ display: "flex", flex: 1, backgroundColor: "#F5F5F5" }} />
      <div style={{ display: "flex", flex: 1, backgroundColor: "#FF4B55" }} />
    </div>
  );
}

/** Logo texte : drapeau + « france-finances.com », « .com » en rouge. */
export function OgLogo({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.4) }}>
      <OgFlag size={Math.round(size * 1.25)} />
      <div style={{ display: "flex", fontSize: size, fontWeight: 800, color: OG_COLORS.text, letterSpacing: "-0.01em" }}>
        france-finances
        <span style={{ color: OG_COLORS.cut }}>.com</span>
      </div>
    </div>
  );
}

/** Bouclier « garder » (même tracé que ShieldIcon). */
export function OgShield({ size, color = OG_COLORS.keepLight }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  );
}

/** Tronçonneuse « à revoir » (même tracé que ChainsawIcon). */
export function OgChainsaw({ size, color = OG_COLORS.amount }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox={CHAINSAW_VIEWBOX} fill={color}>
      {CHAINSAW_PATHS.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
}

/** Déplie les fragments React : le moteur de rendu (satori) ne les accepte pas dans un <svg>. */
function flattenFragments(node: ReactNode): ReactNode[] {
  if (Array.isArray(node)) return node.flatMap(flattenFragments);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return flattenFragments(node.props.children);
  }
  return node === null || node === undefined || typeof node === "boolean" ? [] : [node];
}

function flattenSvg(svg: ReactElement<{ children?: ReactNode }>): ReactElement {
  return cloneElement(svg, {}, ...flattenFragments(svg.props.children));
}

/** Pictogramme de catégorie dans une pastille pleine à la couleur du deck. */
export function OgCategoryBadge({ deckId, size }: { deckId: string; size: number }) {
  const color = getDeckColor(deckId);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundColor: color,
        color: "#FFFFFF",
      }}
    >
      {flattenSvg(CategoryIcon({ deckId, size: Math.round(size * 0.56), strokeWidth: 2.1 }))}
    </div>
  );
}

// === Mise en page ===

/** Pastille de surtitre colorée (fond teinté, texte éclairci). */
export function OgPill({ children, color, size = 26 }: { children: ReactNode; color: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: `${Math.round(size * 0.38)}px ${Math.round(size * 0.85)}px`,
        borderRadius: 999,
        backgroundColor: withAlpha(color, 0.2),
        color: lighten(color, 0.72),
        fontSize: size,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
  );
}

/** Rappel du geste : bouclier « Garder », tronçonneuse « À revoir ». */
export function OgVoteLegend({ size = 30 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: size, fontWeight: 800 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: OG_COLORS.keepLight }}>
        <OgShield size={Math.round(size * 1.3)} />
        Garder
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: OG_COLORS.amount }}>
        <OgChainsaw size={Math.round(size * 1.3)} />
        À revoir
      </div>
    </div>
  );
}

/**
 * Cadre commun : logo en haut à gauche, surtitre éventuel en haut à droite,
 * contenu centré verticalement, pied de page éventuel.
 */
export function OgFrame({
  pill,
  footerLeft,
  footerRight,
  children,
}: {
  pill?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLORS.background,
        color: OG_COLORS.text,
        padding: "52px 72px",
        fontFamily: OG_FONT_FAMILY,
        fontWeight: 600,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <OgLogo />
        {pill}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>{children}</div>
      {footerLeft || footerRight ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex" }}>{footerLeft}</div>
          <div style={{ display: "flex" }}>{footerRight}</div>
        </div>
      ) : null}
    </div>
  );
}

/** Grand titre bleu vif. */
export function OgTitle({ children, size = 76 }: { children: ReactNode; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.04,
        letterSpacing: "-0.02em",
        color: OG_COLORS.title,
      }}
    >
      {children}
    </div>
  );
}

/** Bouton d'appel à l'action (bleu plein, arrondi). */
export function OgCta({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 30px",
        borderRadius: 20,
        backgroundColor: OG_COLORS.brand,
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Chiffre-clé (montant, pourcentage) : les espaces insécables sont rendues
 * par un vrai blanc, l'espace d'Outfit étant trop étroite aux grandes tailles
 * (« 1671 Md€ » au lieu de « 1 671 Md€ »).
 */
export function OgFigure({
  value,
  size,
  color = OG_COLORS.amount,
}: {
  value: string;
  size: number;
  color?: string;
}) {
  const parts = value.split(/[\u00a0\u202f ]/);
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color,
        gap: Math.round(size * 0.2),
      }}
    >
      {parts.map((part, i) => (
        <span key={i}>{part}</span>
      ))}
    </div>
  );
}
