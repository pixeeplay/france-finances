"use client";

import { ChainsawIcon } from "@/components/ChainsawIcon";

export default function InfosPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background/90 backdrop-blur-md z-10 border-b border-border">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          Infos
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {/* About */}
        <section className="px-4 pt-4 pb-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ChainsawIcon size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold">La Tronçonneuse de Poche</h2>
                <p className="text-xs text-muted-foreground">
                  par{" "}
                  <a href="https://nicoquipaie.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">nicoquipaie.co</a>
                  {" "}et{" "}
                  <a href="https://pixeeplay.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pixeeplay</a>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un mini-jeu citoyen pour explorer le budget de la France.
              Swipez les dépenses publiques, découvrez votre profil budgétaire
              et comparez-vous à la communauté. 270 cartes, 17 catégories,
              des données sourcées et neutres.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Comment ça marche ?</h2>
            <div className="flex flex-col gap-3">
              {[
                { step: "1", text: "Choisissez une catégorie ou le mode aléatoire" },
                { step: "2", text: "Swipez les cartes : à gauche pour garder, à droite pour couper" },
                { step: "3", text: "Découvrez votre archétype budgétaire et vos stats" },
                { step: "4", text: "Montez de niveau pour débloquer plus de profondeur" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground pt-0.5">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Sources des données</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toutes les données sont factuelles, sourcées et neutres.
              Pas de ton militant. Les montants sont en milliards d&apos;euros,
              le coût par citoyen est basé sur ~68M d&apos;habitants.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "PLF / LFSS 2025-2026",
                "Cour des comptes",
                "Sénat / Assemblée nationale",
                "Ministères (rapports annuels)",
                "vie-publique.fr",
              ].map((source) => (
                <div key={source} className="flex items-center gap-2 text-sm">
                  <span className="text-primary text-xs">&#9679;</span>
                  <span className="text-muted-foreground">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Contribuer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ce projet est open source. Vous pouvez contribuer en proposant
              de nouvelles cartes, en signalant des erreurs de données,
              ou en améliorant le code.
            </p>
            <a
              href="https://github.com/pixeeplay/tronconneuse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-3 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Voir le projet sur GitHub
            </a>
          </div>
        </section>

        {/* Sponsors */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Sponsors</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ce projet est réalisé bénévolement. Si vous souhaitez
              soutenir son développement, contactez-nous !
            </p>
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                &#9829;
              </div>
              <div>
                <p className="text-sm font-semibold">Devenez sponsor</p>
                <p className="text-xs text-muted-foreground">
                  Aidez à maintenir le projet gratuit et sans pub
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Crédits */}
        <section className="px-4 py-2">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Crédits</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Conception & dev</span>
                <span className="font-medium text-foreground">pixeeplay</span>
              </div>
              <div className="flex justify-between">
                <span>H&eacute;bergement</span>
                <span className="font-medium text-foreground">OVH</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-foreground">1.0 MVP</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Fait avec rigueur (et un peu de tronçonneuse).
          </p>
        </div>
      </div>
    </div>
  );
}
