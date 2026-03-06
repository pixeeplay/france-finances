"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

const stats = [
  { value: 1695, suffix: " Md\u20AC", label: "Budget total de la France", icon: "\uD83C\uDFE6" },
  { value: 330, suffix: "+", label: "Cartes de d\u00E9penses", icon: "\uD83C\uDCCF" },
  { value: 17, suffix: "", label: "Cat\u00E9gories budg\u00E9taires", icon: "\uD83D\uDCC2" },
  { value: 24926, suffix: " \u20AC", label: "D\u00E9pense par citoyen/an", icon: "\uD83D\uDC64" },
];

export function KeyNumbers() {
  return (
    <section id="chiffres" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Les finances publiques en un coup d&apos;oeil
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Des chiffres concrets pour comprendre l&apos;ampleur du budget national
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="hover-lift bg-slate-50 rounded-2xl p-6 text-center border border-slate-100"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                className="text-2xl sm:text-3xl font-bold text-landing-primary font-heading"
              />
              <p className="text-sm text-slate-600 mt-2 leading-snug">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
