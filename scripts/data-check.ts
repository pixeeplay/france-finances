/**
 * npm run data:check — valide src/data (schéma Zod, ids, doublons, URL,
 * coût par habitant, decks-meta, répartition par niveau).
 *
 * Options :
 *   --verbose  affiche aussi chaque avertissement
 *
 * Code de sortie 1 si au moins une erreur.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkData } from "../src/lib/dataCheck";

const dataDir = resolve(process.cwd(), "src/data");
const verbose = process.argv.includes("--verbose");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

const cardsDir = join(dataDir, "cards");
const cardFiles: Record<string, unknown> = {};
for (const file of readdirSync(cardsDir).sort()) {
  if (file.endsWith(".json")) cardFiles[file.replace(/\.json$/, "")] = readJson(join(cardsDir, file));
}

const exceptions = readJson(join(dataDir, "data-check-exceptions.json")) as {
  costPerCitizen?: Record<string, string>;
};

const report = checkData({
  decksMeta: readJson(join(dataDir, "decks-meta.json")),
  cardFiles,
  costExceptions: exceptions.costPerCitizen ?? {},
});

const { stats } = report;
console.log(`data:check — ${stats.decks} decks, ${stats.cards} cartes`);
console.log(`  niveaux : L1=${stats.levels[1]} L2=${stats.levels[2]} L3=${stats.levels[3]}`);
console.log(
  `  nature (jouables) : ${stats.kinds.depense} dépenses, ${stats.kinds.recette} recettes, ${stats.kinds.agregat} agrégats`,
);
console.log(
  `  sources : ${stats.withSourceUrl}/${stats.cards} avec sourceUrl, dont ${stats.homepageSourceUrl} page(s) d'accueil ; ${stats.withYear} carte(s) avec year`,
);

if (verbose) {
  for (const warning of report.warnings) console.warn(`  ⚠ ${warning}`);
} else if (report.warnings.length > 0) {
  console.warn(`  ${report.warnings.length} avertissement(s) (--verbose pour le détail)`);
}

if (report.errors.length > 0) {
  for (const error of report.errors) console.error(`  ✗ ${error}`);
  console.error(`data:check : ${report.errors.length} erreur(s)`);
  process.exit(1);
}
console.log("data:check : OK");
