import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getLexiconEntries, lexiconLetter, type LexiconEntry } from "@/lib/lexique";

const TITLE = "Lexique des finances publiques";
const DESCRIPTION =
  "Les sigles et mots du budget expliqués en français courant : ONDAM, CSG, niche fiscale, loi de finances, dotation, report de charges… De A à Z.";
const PAGE_URL = "https://france-finances.com/lexique";

export const metadata: Metadata = {
  title: `${TITLE} — france-finances.com`,
  description: DESCRIPTION,
  alternates: { canonical: "/lexique" },
  openGraph: {
    title: `${TITLE} — france-finances.com`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    locale: "fr_FR",
  },
};

/** Entrées regroupées par lettre, dans l'ordre (« 0-9 » d'abord). */
function groupByLetter(entries: readonly LexiconEntry[]): Array<[string, LexiconEntry[]]> {
  const groups = new Map<string, LexiconEntry[]>();
  for (const entry of entries) {
    const letter = lexiconLetter(entry.key);
    const group = groups.get(letter);
    if (group) group.push(entry);
    else groups.set(letter, [entry]);
  }
  return [...groups.entries()];
}

function letterId(letter: string): string {
  return `lettre-${letter.toLowerCase()}`;
}

export default function LexiquePage() {
  const entries = getLexiconEntries();
  const groups = groupByLetter(entries);
  const termCount = entries.filter((e) => !e.expansion).length;

  // Données structurées : ensemble de termes définis (schema.org DefinedTermSet)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    inLanguage: "fr",
    hasDefinedTerm: entries.map((e) => ({
      "@type": "DefinedTerm",
      name: e.key,
      ...(e.expansion ? { alternateName: e.expansion } : {}),
      description: e.definition ?? e.expansion,
      url: `${PAGE_URL}#${e.slug}`,
    })),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // Données statiques du site, sans contenu saisi par les visiteurs
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="mb-8">
        <p className="inline-flex kicker rounded-full bg-info/15 px-3 py-1 text-info">
          {entries.length} entrées · dont {termCount} mots du budget
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-brand-fg">
          Le lexique
        </h1>
        <p className="mt-4 max-w-prose text-base text-muted-foreground leading-relaxed">
          Les sigles et les mots techniques qu&apos;on croise dans les cartes du jeu, les{" "}
          <Link href="/chiffres" className="underline underline-offset-2 hover:text-foreground">
            chiffres
          </Link>{" "}
          et le{" "}
          <Link href="/simulateur" className="underline underline-offset-2 hover:text-foreground">
            simulateur
          </Link>
          , expliqués simplement. Partout sur le site, un mot souligné en pointillés s&apos;explique d&apos;un
          appui.
        </p>
      </header>

      {/* Navigation A–Z, collante sous la barre du site */}
      <nav
        aria-label="Lettres du lexique"
        className="sticky top-16 z-10 -mx-4 sm:mx-0 mb-8 px-4 sm:px-3 py-2 bg-background/95 backdrop-blur-md border-y sm:border sm:rounded-2xl border-border"
      >
        <ul className="flex gap-1 lg:gap-0 overflow-x-auto lg:justify-between">
          {groups.map(([letter]) => (
            <li key={letter} className="shrink-0">
              <a
                href={`#${letterId(letter)}`}
                className="inline-flex items-center justify-center min-w-[44px] lg:min-w-[38px] min-h-[44px] px-2 lg:px-1 rounded-xl font-heading font-bold text-sm text-foreground hover:bg-muted transition-colors"
              >
                {letter}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {groups.map(([letter, items]) => (
          <section key={letter} aria-labelledby={letterId(letter)} className="scroll-mt-44">
            <h2
              id={letterId(letter)}
              className="scroll-mt-44 font-heading text-3xl font-black text-brand-fg border-b border-border pb-2 mb-4"
            >
              {letter}
            </h2>
            <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
              {items.map((entry) => (
                <div key={entry.slug} id={entry.slug} className="scroll-mt-44 max-w-prose">
                  <dt className="font-heading font-bold text-foreground">
                    <a href={`#${entry.slug}`} className="hover:underline underline-offset-2">
                      {entry.key}
                    </a>
                    {entry.expansion ? (
                      <span className="font-sans font-medium text-muted-foreground"> — {entry.expansion}</span>
                    ) : null}
                  </dt>
                  {entry.definition && entry.definition !== entry.expansion ? (
                    <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{entry.definition}</dd>
                  ) : null}
                  {entry.source ? (
                    <dd className="mt-1 text-xs text-muted-foreground">
                      Source :{" "}
                      <a
                        href={entry.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        {entry.source.label}
                        <span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-12 max-w-prose text-sm text-muted-foreground">
        Un mot manque ou une définition n&apos;est pas claire ?{" "}
        <Link href="/contribuer" className="underline underline-offset-2 hover:text-foreground">
          Proposez une correction
        </Link>
        .
      </p>
    </PageShell>
  );
}
