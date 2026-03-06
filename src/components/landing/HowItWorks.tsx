"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choisissez une cat\u00E9gorie",
    description: "D\u00E9fense, Sant\u00E9, \u00C9ducation, Social\u2026 Explorez les 17 cat\u00E9gories du budget.",
    icon: "\uD83D\uDCC2",
  },
  {
    number: "02",
    title: "Swipez les d\u00E9penses",
    description: "Pour chaque poste budg\u00E9taire, d\u00E9cidez : garder ou remettre en question ?",
    icon: "\uD83D\uDC48",
  },
  {
    number: "03",
    title: "D\u00E9couvrez votre profil",
    description: "Obtenez votre arch\u00E9type budg\u00E9taire et comparez-vous \u00E0 la communaut\u00E9.",
    icon: "\uD83C\uDFC6",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="section-padding bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            3 étapes pour devenir incollable sur les finances publiques
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative bg-white rounded-2xl p-8 border border-slate-200 hover-lift"
            >
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-landing-primary text-white font-heading font-bold text-sm flex items-center justify-center">
                {step.number}
              </div>
              <div className="text-4xl mb-4 mt-2">{step.icon}</div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
