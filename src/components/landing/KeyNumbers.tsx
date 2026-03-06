"use client";

import { AnimatedNumber } from "./AnimatedNumber";

const numbers = [
  { value: 1600, suffix: " Md\u20AC", label: "D\u00E9penses publiques", color: "text-landing-expense" },
  { value: 370, suffix: " Md\u20AC", label: "Retraites", color: "text-landing-expense" },
  { value: 55, suffix: " Md\u20AC", label: "Int\u00E9r\u00EAts dette", color: "text-landing-expense" },
  { value: 85, suffix: " Md\u20AC", label: "Bouclier \u00E9nergie", color: "text-landing-expense" },
  { value: 110, suffix: " Md\u20AC", label: "H\u00F4pital public", color: "text-landing-expense" },
  { value: 340, suffix: "", label: "Cartes \u00E0 d\u00E9couvrir", color: "text-landing-primary" },
];

export function KeyNumbers() {
  return (
    <section id="chiffres" className="section-padding">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-12 text-landing-primary">
          Les chiffres clés
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {numbers.map((n, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white border border-slate-200 hover-lift transition-all"
            >
              <div className={`font-heading font-extrabold text-3xl md:text-4xl ${n.color}`}>
                <AnimatedNumber
                  value={n.value}
                  suffix={n.suffix ? ` ${n.suffix.trim()}` : ""}
                  replayInterval={30000}
                  className={n.color}
                />
              </div>
              <div className="text-sm text-slate-500 mt-2">{n.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
