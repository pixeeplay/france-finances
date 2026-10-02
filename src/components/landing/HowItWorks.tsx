import type { ReactNode } from "react";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ReinforceIcon } from "@/components/ReinforceIcon";
import { StopIcon } from "@/components/StopIcon";

function IconProfile() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      <path d="m16.5 3.5 1.5-1.5M19 6h2" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <rect x="5" y="11" width="3" height="7" rx="1" />
      <rect x="10.5" y="6" width="3" height="12" rx="1" />
      <rect x="16" y="3" width="3" height="15" rx="1" />
    </svg>
  );
}

interface Step {
  title: string;
  description: string;
  icon: ReactNode;
  /** Pastille colorée (fond teinté + couleur du pictogramme) */
  chip: string;
}

const STEPS: Step[] = [
  {
    title: "Swipez",
    description: "Chaque carte = une dépense publique réelle. Gardez-la ou remettez-la en question.",
    icon: <ChainsawIcon size={32} variant="white" />,
    chip: "bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-600/30",
  },
  {
    title: "Découvrez",
    description: "Votre profil budgétaire et comment vous vous situez par rapport aux autres joueurs.",
    icon: <IconProfile />,
    chip: "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-600/30",
  },
  {
    title: "Approfondissez",
    description: "Explorez les chiffres officiels, simulez votre contribution, passez au niveau supérieur.",
    icon: <IconChart />,
    chip: "bg-gradient-to-br from-amber-300 to-amber-600 text-white shadow-lg shadow-amber-600/30",
  },
];

const GESTURES = [
  { label: "Garder", hint: "vers la gauche", icon: <ShieldIcon size={14} className="text-white" />, dot: "bg-primary", className: "text-primary bg-primary/15 border-primary/50" },
  { label: "À revoir", hint: "vers la droite", icon: <ChainsawIcon size={14} variant="white" />, dot: "bg-red-500", className: "text-danger bg-danger/15 border-danger/50" },
  { label: "Renforcer", hint: "vers le haut (niv. 2)", icon: <ReinforceIcon size={14} className="text-white" />, dot: "bg-blue-500", className: "text-info bg-info/15 border-info/50" },
  { label: "Injustifié", hint: "vers le bas (niv. 2)", icon: <StopIcon size={14} className="text-white" />, dot: "bg-red-500", className: "text-danger bg-danger/15 border-danger/50" },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" aria-labelledby="howto-title" className="section-padding bg-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="howto-title" className="text-3xl md:text-4xl text-center mb-12 text-brand-fg dark:text-foreground">
          Comment ça marche&nbsp;?
        </h2>

        <ol className="grid md:grid-cols-3 gap-10 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${step.chip}`} aria-hidden="true">
                {step.icon}
              </div>
              <p className="kicker text-muted-foreground mb-2">Étape {i + 1}</p>
              <h3 className="text-xl mb-2 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </li>
          ))}
        </ol>

        <h3 className="sr-only">Les gestes du jeu</h3>
        <dl className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {GESTURES.map((g) => (
            <div
              key={g.label}
              className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold ${g.className}`}
            >
              <dt className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${g.dot}`}>{g.icon}</span>
                {g.label}
              </dt>
              <dd className="font-normal text-muted-foreground">
                <span className="sr-only">: glisser </span>
                <span aria-hidden="true">· </span>
                {g.hint}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
