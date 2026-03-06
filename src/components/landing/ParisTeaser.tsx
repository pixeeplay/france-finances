"use client";

import { useState, type FormEvent } from "react";

export function ParisTeaser() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    // Store locally for now (Mailchimp/Brevo later)
    const stored = JSON.parse(localStorage.getItem("paris_emails") || "[]") as string[];
    if (!stored.includes(email)) {
      stored.push(email);
      localStorage.setItem("paris_emails", JSON.stringify(stored));
    }
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="section-padding bg-gradient-to-br from-landing-primary to-landing-primary-light text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-4xl mb-6">&#127919;</div>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
          Les Paris budgétaires
        </h2>
        <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Bientôt disponible : pariez sur l&apos;évolution des postes budgétaires
          et mesurez votre sens de la prévision économique.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full text-sm font-semibold">
            <span>&#10003;</span> Merci ! Vous serez prévenu(e) au lancement.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="flex-1 px-5 py-3 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-white text-landing-primary font-bold text-sm hover:bg-blue-50 transition-colors"
            >
              Me prévenir
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
