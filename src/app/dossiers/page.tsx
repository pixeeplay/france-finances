import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { DossierCard } from "@/components/dossiers/DossierParts";
import { UiIcon } from "@/components/icons/UiIcon";
import { getVisibleDossiers } from "@/data/dossiers";
import { hasVisibleDossiers, readingMinutes } from "@/lib/dossiers";

const TITLE = "Les dossiers";
const DESCRIPTION =
  "Des articles courts, neutres et sourcés pour comprendre les finances publiques : où va la CSG, pourquoi la dette coûte plus cher, qui paie l'impôt sur le revenu.";

export const metadata: Metadata = {
  title: `${TITLE} — france-finances.com`,
  description: DESCRIPTION,
  alternates: { canonical: "/dossiers" },
  // Pas d'indexation tant qu'aucun dossier n'est publié
  robots: hasVisibleDossiers() ? undefined : { index: false },
  openGraph: {
    title: `${TITLE} — france-finances.com`,
    description: DESCRIPTION,
    url: "https://france-finances.com/dossiers",
    type: "website",
    locale: "fr_FR",
  },
};

export default function DossiersPage() {
  const dossiers = getVisibleDossiers();

  return (
    <PageShell>
      <header className="mb-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
          <UiIcon name="search" size={14} />
          Comprendre · chiffres officiels
        </p>
        <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-black leading-[1.05] text-brand-fg">{TITLE}</h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
          Des articles courts pour comprendre d&apos;où vient l&apos;argent public et où il va. Chaque chiffre renvoie à
          un document officiel, et chaque dossier se termine par les cartes du jeu correspondantes.
        </p>
      </header>

      {dossiers.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {dossiers.map((d) => (
            <li key={d.slug}>
              <DossierCard dossier={d} minutes={readingMinutes(d)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-prose rounded-2xl border border-border bg-card p-6 text-muted-foreground">
          Les premiers dossiers sont en cours de relecture. En attendant, explorez{" "}
          <Link href="/chiffres" className="underline underline-offset-2 hover:text-foreground">
            les chiffres clés
          </Link>
          .
        </p>
      )}

      <p className="mt-12 max-w-prose text-sm text-muted-foreground">
        Envie de jouer par thème plutôt que de lire ? Les decks{" "}
        <Link href="/#themes" className="underline underline-offset-2 hover:text-foreground">
          thématiques
        </Link>{" "}
        traversent plusieurs catégories du budget. Une erreur, une source à proposer ?{" "}
        <Link href="/contribuer" className="underline underline-offset-2 hover:text-foreground">
          Contribuez
        </Link>
        .
      </p>
    </PageShell>
  );
}
