import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background/90 backdrop-blur-md z-10 border-b border-border">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          Politique de confidentialit&eacute;
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {/* Introduction */}
        <section className="px-4 pt-4 pb-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Introduction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La Tronçonneuse de Poche (accessible sur france-finances.com)
              est un mini-jeu citoyen &eacute;ducatif. Nous attachons une grande
              importance &agrave; la protection de vos donn&eacute;es personnelles.
              Cette politique d&eacute;crit les donn&eacute;es collect&eacute;es,
              leur finalit&eacute; et vos droits.
            </p>
          </div>
        </section>

        {/* Donn&eacute;es collect&eacute;es */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Donn&eacute;es collect&eacute;es</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nous collectons uniquement des donn&eacute;es anonymes de session
              de jeu, n&eacute;cessaires au fonctionnement du service :
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Cat\u00e9gorie (deck) jou\u00e9e",
                "Votes (garder / couper) par carte, sans identification du joueur",
                "Arch\u00e9type budg\u00e9taire calcul\u00e9 en fin de session",
                "Dur\u00e9e de la session",
                "Adresse IP anonymis\u00e9e (dernier octet remplac\u00e9 par z\u00e9ro)",
                "Page visit\u00e9e et r\u00e9f\u00e9rent (analytics internes)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-primary text-xs">&#9679;</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le User-Agent du navigateur n&apos;est <strong>pas</strong> stock&eacute;.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nous n&apos;utilisons <strong>aucun cookie de tra&ccedil;age</strong> ni
              de publicit&eacute;. Si vous vous connectez via Google ou GitHub,
              un cookie de session d&apos;authentification est d&eacute;pos&eacute;
              (strictement n&eacute;cessaire au maintien de votre connexion).
              Aucun cookie tiers n&apos;est utilis&eacute;.
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Analytics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nous utilisons un syst&egrave;me d&apos;analytics <strong>auto-h&eacute;berg&eacute;</strong> sur
              nos propres serveurs. Aucun service tiers (Google Analytics,
              Facebook Pixel, etc.) n&apos;est utilis&eacute;. Les donn&eacute;es
              d&apos;analytics ne sont jamais partag&eacute;es avec des tiers.
            </p>
          </div>
        </section>

        {/* Stockage et localisation */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Stockage et localisation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les donn&eacute;es sont stock&eacute;es dans une base PostgreSQL
              h&eacute;berg&eacute;e sur nos propres serveurs (OVH, France).
              Aucun transfert de donn&eacute;es n&apos;est effectu&eacute;
              en dehors de l&apos;Union europ&eacute;enne.
            </p>
          </div>
        </section>

        {/* Conservation */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Dur&eacute;e de conservation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les &eacute;v&eacute;nements d&apos;analytics (pages vues,
              interactions) sont conserv&eacute;s pendant <strong>90 jours</strong>,
              puis automatiquement purg&eacute;s. Les sessions de jeu et les
              votes agr&eacute;g&eacute;s sont conserv&eacute;s sans limite
              de dur&eacute;e, car ils sont anonymes et n&eacute;cessaires au
              fonctionnement communautaire du jeu (classements, statistiques).
            </p>
          </div>
        </section>

        {/* Droits */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Vos droits</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la
              Protection des Donn&eacute;es (RGPD), vous disposez d&apos;un droit
              d&apos;acc&egrave;s, de rectification et de suppression de vos
              donn&eacute;es. &Eacute;tant donn&eacute; le caract&egrave;re anonyme
              des donn&eacute;es collect&eacute;es, l&apos;exercice de ces droits
              peut n&eacute;cessiter que vous nous fournissiez des informations
              permettant de vous identifier (par exemple, votre adresse e-mail
              de connexion).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pour toute demande, contactez-nous &agrave; l&apos;adresse :
            </p>
            <a
              href="mailto:contact@nicoquipaie.co"
              className="flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-3 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              contact@nicoquipaie.co
            </a>
          </div>
        </section>

        {/* Retour */}
        <div className="px-4 py-6 text-center">
          <Link
            href="/infos"
            className="text-sm text-primary hover:underline"
          >
            &larr; Retour aux infos
          </Link>
        </div>
      </div>
    </div>
  );
}
