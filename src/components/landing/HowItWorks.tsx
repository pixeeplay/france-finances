"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    icon: "chainsaw",
    title: "Swipez",
    description: "Chaque carte = une d\u00E9pense publique r\u00E9elle. Gardez-la ou remettez-la en question.",
  },
  {
    icon: "decouvrir",
    title: "D\u00E9couvrez",
    description: "Votre profil budg\u00E9taire et comment vous vous comparez \u00E0 la communaut\u00E9.",
  },
  {
    icon: "approfondir",
    title: "Approfondissez",
    description: "Explorez les chiffres, d\u00E9battez, simulez votre contribution.",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="section-padding bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-12 text-landing-primary dark:text-white">
          Comment ça marche ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-landing-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-landing-primary/15 transition-colors">
                {step.icon === "chainsaw" ? (
                  <Image src="/chainsaw.svg" alt="" width={28} height={28} style={{ filter: "brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(7471%) hue-rotate(353deg) brightness(91%) contrast(95%)" }} />
                ) : step.icon === "decouvrir" ? (
                  <Image src="/decouvrir.svg" alt="" width={28} height={28} style={{ filter: "brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(7471%) hue-rotate(353deg) brightness(91%) contrast(95%)", transform: "scaleX(-1)" }} />
                ) : step.icon === "approfondir" ? (
                  <Image src="/approfondir.svg" alt="" width={28} height={28} style={{ filter: "brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(7471%) hue-rotate(353deg) brightness(91%) contrast(95%)" }} />
                ) : (
                  <span className="text-2xl">{step.icon}</span>
                )}
              </div>
              <div className="text-xs font-heading font-semibold text-landing-primary dark:text-slate-300 mb-2 tracking-widest uppercase">
                Étape {i + 1}
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-slate-900 dark:text-slate-50">
                {step.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
