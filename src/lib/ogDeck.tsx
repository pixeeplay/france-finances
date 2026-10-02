/**
 * Images Open Graph des decks : pages /categories/[deckId] et /jeu/[deckId]
 * (catégories, dossiers, deck du jour, mode aléatoire).
 */
import { ImageResponse } from "next/og";
import decksMeta from "@/data/decks-meta.json";
import { getDeckCards } from "@/data/getCardsByDeck";
import { DAILY_CARD_COUNT, DAILY_DECK_ID, DAILY_EXCLUDED_DECKS } from "@/lib/daily";
import { getDeckColor } from "@/lib/deckMeta";
import { formatBillions } from "@/lib/format";
import {
  OG_COLORS,
  OgCategoryBadge,
  OgCta,
  OgFigure,
  OgFrame,
  OgPill,
  OgTitle,
  OgVoteLegend,
  ogImageOptions,
} from "@/lib/og";
import { pickSampleCards, truncateLabel } from "@/lib/ogHelpers";
import type { Card } from "@/types";

function SampleCard({ card, color }: { card: Card; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        flex: 1,
        height: 156,
        padding: "22px 22px 18px",
        borderRadius: 24,
        backgroundColor: OG_COLORS.card,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 22,
          width: 64,
          height: 7,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          display: "block",
          height: 58,
          overflow: "hidden",
          lineClamp: 2,
          fontSize: 25,
          fontWeight: 800,
          lineHeight: 1.15,
          color: OG_COLORS.text,
        }}
      >
        {card.title}
      </div>
      <OgFigure value={formatBillions(card.amountBillions)} size={44} />
    </div>
  );
}

/** Mosaïque de pastilles de catégorie (deck du jour, mode aléatoire). */
function CategoryMosaic({ count }: { count: number }) {
  const ids = decksMeta.decks
    .filter((d) => d.type === "main" && !DAILY_EXCLUDED_DECKS.includes(d.id))
    .slice(0, count)
    .map((d) => d.id);
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {ids.map((id) => (
        <OgCategoryBadge key={id} deckId={id} size={92} />
      ))}
    </div>
  );
}

function DeckHeading({ title, description, badge }: { title: string; description: string; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      {badge ? <OgCategoryBadge deckId={badge} size={124} /> : null}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <OgTitle size={title.length > 24 ? 60 : 76}>{title}</OgTitle>
        {description ? (
          <div style={{ display: "flex", fontSize: 32, color: OG_COLORS.muted, marginTop: 10, lineHeight: 1.2 }}>
            {truncateLabel(description, 70)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Image Open Graph d'un deck (ou du deck du jour / mode aléatoire). */
export async function renderDeckOgImage(deckId: string, cta: string): Promise<ImageResponse> {
  const options = await ogImageOptions();
  const deck = decksMeta.decks.find((d) => d.id === deckId);

  if (!deck) {
    const isDaily = deckId === DAILY_DECK_ID;
    const color = isDaily ? "#F59E0B" : OG_COLORS.title;
    return new ImageResponse(
      (
        <OgFrame
          pill={<OgPill color={color}>{isDaily ? "Deck du jour" : "Mode aléatoire"}</OgPill>}
          footerLeft={<OgVoteLegend />}
          footerRight={<OgCta>{isDaily ? "Jouer le deck du jour" : "Jouer"}</OgCta>}
        >
          <DeckHeading
            title={isDaily ? `${DAILY_CARD_COUNT} dépenses, les mêmes pour tous` : "Des dépenses tirées au hasard"}
            description={
              isDaily
                ? "Un nouveau tirage chaque jour, puis comparez vos résultats."
                : "Toutes les catégories du budget, mélangées."
            }
          />
          <div style={{ display: "flex", marginTop: 40 }}>
            <CategoryMosaic count={DAILY_CARD_COUNT} />
          </div>
        </OgFrame>
      ),
      options,
    );
  }

  const color = getDeckColor(deck.id);
  const cards = await getDeckCards(deck.id);
  const samples = pickSampleCards(cards);
  const kicker = deck.type === "thematic" ? "Dossier" : "Catégorie";

  return new ImageResponse(
    (
      <OgFrame
        pill={<OgPill color={color}>{`${kicker} · ${cards.length} cartes`}</OgPill>}
        footerLeft={<OgVoteLegend />}
        footerRight={<OgCta>{cta}</OgCta>}
      >
        <DeckHeading title={deck.name} description={deck.description} badge={deck.id} />
        <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
          {samples.map((card) => (
            <SampleCard key={card.id} card={card} color={color} />
          ))}
        </div>
      </OgFrame>
    ),
    options,
  );
}
