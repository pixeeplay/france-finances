import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CHART_PALETTE_CLASS } from "@/components/chiffres/palette";
import { DossierBlockView } from "@/components/dossiers/DossierBlocks";
import { DossierCard, DraftBanner, RelatedCards, SourcesList } from "@/components/dossiers/DossierParts";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import { getDossier, getVisibleDossiers } from "@/data/dossiers";
import { formatDossierDate, readingMinutes, sourceNumbers } from "@/lib/dossiers";

const SITE_URL = "https://france-finances.com";

interface Props {
  params: Promise<{ slug: string }>;
}

// Seuls les dossiers visibles sont générés : un brouillon renvoie une 404 en production
export const dynamicParams = false;

export function generateStaticParams() {
  return getVisibleDossiers().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dossier = getDossier(slug);
  if (!dossier) return {};
  const title = `${dossier.title} — france-finances.com`;
  return {
    title,
    description: dossier.description,
    alternates: { canonical: `/dossiers/${dossier.slug}` },
    robots: dossier.status === "publie" ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description: dossier.description,
      url: `${SITE_URL}/dossiers/${dossier.slug}`,
      type: "article",
      locale: "fr_FR",
      publishedTime: dossier.publishedAt,
      modifiedTime: dossier.updatedAt,
      section: dossier.kicker,
    },
    twitter: { card: "summary_large_image", title, description: dossier.description },
  };
}

export default async function DossierPage({ params }: Props) {
  const { slug } = await params;
  const dossier = getDossier(slug);
  if (!dossier) notFound();

  const numbers = sourceNumbers(dossier.sources);
  const minutes = readingMinutes(dossier);
  const others = getVisibleDossiers().filter((d) => d.slug !== dossier.slug);
  const url = `${SITE_URL}/dossiers/${dossier.slug}`;

  // Données structurées : article (schema.org Article)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dossier.title,
    description: dossier.description,
    inLanguage: "fr",
    datePublished: dossier.publishedAt,
    dateModified: dossier.updatedAt,
    articleSection: dossier.kicker,
    url,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
    author: { "@type": "Organization", name: "france-finances.com", url: SITE_URL },
    publisher: { "@type": "Organization", name: "france-finances.com", url: SITE_URL },
    citation: dossier.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // Données statiques du site, sans contenu saisi par les visiteurs
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className={CHART_PALETTE_CLASS} style={catStyle(dossier.deckId)}>
        <Link
          href="/dossiers"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">&larr;</span> Tous les dossiers
        </Link>

        {dossier.status === "brouillon" ? <DraftBanner /> : null}

        <article aria-labelledby="dossier-title">
          <header className="mt-2 max-w-3xl">
            <p className="flex items-center gap-3">
              <CategoryBadge deckId={dossier.deckId} size={44} />
              <span className="kicker cat-text">Dossier · {dossier.kicker}</span>
            </p>
            <h1
              id="dossier-title"
              className="mt-4 font-heading text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-brand-fg"
            >
              {dossier.title}
            </h1>
            <p className="mt-4 text-lg sm:text-xl leading-relaxed text-foreground">{dossier.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              <time dateTime={dossier.publishedAt}>{formatDossierDate(dossier.publishedAt)}</time>
              {dossier.updatedAt !== dossier.publishedAt ? (
                <>
                  {" "}
                  · mis à jour le <time dateTime={dossier.updatedAt}>{formatDossierDate(dossier.updatedAt)}</time>
                </>
              ) : null}{" "}
              · {minutes} min de lecture · {dossier.sources.length} sources officielles
            </p>
          </header>

          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-10">
            {/* Sommaire : encadré en mobile, colonne collante en desktop */}
            <nav
              aria-label="Sommaire"
              className="mb-8 rounded-2xl border border-border bg-card p-4 lg:col-span-3 lg:mb-0 lg:self-start lg:sticky lg:top-24 lg:border-0 lg:bg-transparent lg:p-0"
            >
              <p className="kicker text-muted-foreground">Sommaire</p>
              <ol className="mt-2 space-y-0.5">
                {dossier.sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <span className="w-5 shrink-0 font-heading font-black tabular-nums cat-text">{i + 1}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#sources-title"
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <span className="w-5 shrink-0" aria-hidden="true" />
                    Sources
                  </a>
                </li>
              </ol>
            </nav>

            <div className="min-w-0 lg:col-span-8">
              {dossier.sections.map((section, i) => (
                <section key={section.id} aria-labelledby={section.id} className="mb-12 last:mb-0">
                  <h2
                    id={section.id}
                    className="scroll-mt-24 flex items-baseline gap-3 font-heading text-2xl sm:text-3xl font-extrabold leading-tight text-foreground"
                  >
                    <span className="font-black tabular-nums cat-text" aria-hidden="true">
                      {i + 1}.
                    </span>
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-5">
                    {section.blocks.map((block, j) => (
                      <DossierBlockView key={j} block={block} numbers={numbers} sources={dossier.sources} />
                    ))}
                  </div>
                </section>
              ))}

              <RelatedCards cardIds={dossier.cardIds} />
              <SourcesList sources={dossier.sources} />

              <p className="mt-8 max-w-prose text-sm text-muted-foreground">
                Ce dossier est rédigé par france-finances.com à partir des documents officiels cités ci-dessus, sans
                prise de position. Une erreur, un chiffre à mettre à jour ?{" "}
                <Link href="/contribuer" className="underline underline-offset-2 hover:text-foreground">
                  Signalez-le
                </Link>
                .
              </p>
            </div>
          </div>
        </article>

        {others.length > 0 ? (
          <section aria-labelledby="autres-title" className="mt-16 border-t border-border pt-10">
            <h2 id="autres-title" className="font-heading text-2xl font-extrabold text-foreground">
              Autres dossiers
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {others.map((d) => (
                <li key={d.slug}>
                  <DossierCard dossier={d} minutes={readingMinutes(d)} headingLevel={3} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
