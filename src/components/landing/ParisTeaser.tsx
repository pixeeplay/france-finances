"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

export function ParisTeaser() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    const stored = JSON.parse(localStorage.getItem("paris_emails") || "[]") as string[];
    if (!stored.includes(email)) {
      stored.push(email);
      localStorage.setItem("paris_emails", JSON.stringify(stored));
    }
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section
      id="paris"
      className="section-padding"
      style={{
        background: "linear-gradient(135deg, hsl(224 100% 30% / 0.04), hsl(224 100% 30% / 0.08))",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/PSG-PARIS.svg"
            alt="Paris"
            width={64}
            height={64}
            className="drop-shadow-md"
          />
        </div>
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-landing-primary dark:text-white mb-4">
          Budget Swipe arrive pour{" "}
          <span className="text-landing-expense">Paris</span>.
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          11 Md&euro; de budget municipal &agrave; passer &agrave; la tron&ccedil;onneuse.
          <br />
          Pistes cyclables, JO, propret&eacute;, logement social...
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-landing-primary/10 text-landing-primary px-6 py-3 rounded-full text-sm font-semibold">
            <span>&#10003;</span> Vous serez pr&eacute;venu(e) du lancement !
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="flex-1 h-12 px-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-landing-primary/30"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-landing-primary text-white font-heading font-semibold text-sm hover:bg-landing-primary-light transition-colors whitespace-nowrap"
            >
              Pr&eacute;venez-moi
            </button>
          </form>
        )}

        <p className="text-sm text-slate-400 dark:text-slate-500">
          Prochaines villes :{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Lyon &middot; Marseille &middot; Toulouse &middot; Bordeaux
          </span>
        </p>
      </div>
    </section>
  );
}
