import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { NavbarLanding } from "@/components/landing/NavbarLanding";

export const metadata: Metadata = {
  title: "Contribuer — france-finances.com",
  description:
    "Proposez des cartes de dépenses publiques pour Budget Swipe. Guide du contributeur, format JSON, règles éditoriales.",
  alternates: { canonical: "/contribuer" },
  openGraph: {
    title: "Contribuer — france-finances.com",
    description:
      "Proposez des cartes de dépenses publiques pour Budget Swipe. Ouvert à tous.",
    url: "https://france-finances.com/contribuer",
    images: [DEFAULT_OG_IMAGE],
  },
};

const sources = [
  "vie-publique.fr, PLF/PLFSS (budget.gouv.fr)",
  "Sénat, Assemblée nationale, Cour des comptes",
  "INSEE, DREES, DARES",
  "Sites des collectivités (budgets primitifs)",
  "Opérateurs publics (ADEME, CNAF, CNAM…)",
  "Presse de référence (Le Monde, Les Échos…)",
];

const checklist = [
  "Le JSON est valide et respecte le schéma",
  "L'ID est unique et suit la convention de nommage",
  "Le titre est compréhensible en 5 secondes",
  "Le montant est vérifié dans au moins 1 source officielle",
  "Le coût par citoyen est correct (montant / population)",
  "Le contexte est factuel, neutre, 2-4 phrases",
  "L'équivalence est concrète et mémorable",
  "Au moins 1 source officielle avec URL valide",
  "Pas de doublon avec une carte existante",
  "Données à jour (2024-2026)",
];

const cardExample = `{
  "id": "san-01",
  "title": "Dépenses d'assurance maladie (ONDAM)",
  "subtitle": "Objectif national voté chaque année : soins de ville, hôpitaux, établissements médico-sociaux",
  "description": "Plafond de dépenses de l'assurance maladie voté chaque année par le Parlement…",
  "amountBillions": 266,
  "costPerCitizen": 3848,
  "deckId": "sante",
  "icon": "🏛️",
  "source": "Sénat (PLFSS 2026), Vie-publique.fr LFSS 2025, Cour des comptes",
  "sourceUrl": "https://www.senat.fr/rap/l25-131-1/l25-131-1_mono.html",
  "year": 2025,
  "sourceDate": "2025-11-15",
  "level": 1,
  "tags": ["santé", "ONDAM", "assurance maladie"],
  "equivalence": "Environ 4 fois le budget de la Défense"
}`;

export default function ContribuerPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-brand-fg">
          Contribuer au projet
        </h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          Tout le monde peut proposer des cartes ou des decks complets
          de dépenses publiques pour Budget Swipe.
        </p>

        {/* Ce qu'on cherche */}
        <Section title="Ce qu'on cherche">
          <ul className="space-y-2">
            {[
              "Des cartes factuelles et sourcées sur les finances publiques françaises",
              "Des decks régionaux (chaque région mérite son deck de 20 cartes)",
              "Des decks villes (Paris existe, Lyon, Marseille, Toulouse, Bordeaux à créer)",
              "Des decks thématiques sur un sujet précis",
              "Des mises à jour quand les chiffres changent (PLF/PLFSS)",
              "Des corrections si une donnée est erronée ou périmée",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-foreground mt-0.5 shrink-0">&#9679;</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Règles éditoriales */}
        <Section title="Règles éditoriales">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Factuel, pas militant.</strong>{" "}
              La carte présente les faits et les deux côtés du débat.
            </p>
            <p>
              <strong className="text-foreground">Concret, pas abstrait.</strong>{" "}
              Toujours ramener au coût par habitant et à une équivalence parlante.
            </p>
            <p>
              <strong className="text-foreground">Compréhensible en 5 secondes.</strong>{" "}
              Le titre et le montant doivent suffire à comprendre.
            </p>
            <p>
              <strong className="text-foreground">Sourcé, toujours.</strong>{" "}
              Pas de &laquo;&nbsp;on estime que&nbsp;&raquo; sans dire qui estime.
            </p>
          </div>
        </Section>

        {/* Sources acceptées */}
        <Section title="Sources acceptées">
          <ol className="space-y-2 list-decimal list-inside">
            {sources.map((s) => (
              <li key={s} className="text-sm text-muted-foreground">{s}</li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground mt-3 italic">
            Sources refusées : blogs personnels, forums, réseaux sociaux, sites militants sans données sourcées.
          </p>
        </Section>

        {/* Format d'une carte */}
        <Section title="Format JSON d'une carte">
          <pre className="bg-card border border-border rounded-lg font-mono p-4 text-xs text-foreground overflow-x-auto leading-relaxed">
            {cardExample}
          </pre>
          <p className="text-sm text-muted-foreground mt-3">
            Le guide complet détaille tous les champs (obligatoires et optionnels),
            les conventions de nommage des IDs, le format des decks, et le schéma JSON de validation.
          </p>
        </Section>

        {/* Checklist */}
        <Section title="Checklist de validation">
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground shrink-0">&#9744;</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Comment soumettre */}
        <Section title="Comment soumettre">
          <div className="space-y-4">
            <SubmitOption
              step="1"
              title="Téléchargez le guide"
              description="Le guide complet détaille le format JSON, les conventions et les règles éditoriales."
            />
            <SubmitOption
              step="2"
              title="Préparez vos cartes"
              description="Rédigez vos cartes en suivant le format et la checklist de validation."
            />
            <SubmitOption
              step="3"
              title="Contactez-nous"
              description="Envoyez-nous votre proposition via le formulaire de contact. Nous nous chargeons de l'intégration."
            />
          </div>
        </Section>

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a
            href="/CONTRIBUER.md"
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-2xl bg-brand text-white font-heading font-bold text-sm hover:bg-brand-hover transition-colors"
          >
            <DownloadIcon />
            Télécharger le guide complet
          </a>
          <a
            href="https://pixeeplay.com/play/?intent=contribuer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-2xl border-2 border-border bg-card text-foreground font-heading font-bold text-sm hover:bg-muted transition-colors"
          >
            Nous contacter
            <span>&#8594;</span>
          </a>
        </div>

        {/* Licence */}
        <p className="mt-10 text-xs text-muted-foreground">
          Les cartes contribuées sont publiées sous licence Creative Commons BY-SA 4.0.
          En soumettant une carte, vous acceptez cette licence.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] text-sm underline underline-offset-4 hover:text-foreground"
          >
            &larr; Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-extrabold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function SubmitOption({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-brand text-white font-heading flex items-center justify-center text-sm font-extrabold shrink-0">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
