import type { Card, Deck } from "@/types";

import decksMeta from "./decks-meta.json";

// Import per-category card files
import defenseCards from "./cards/defense.json";
import energieCards from "./cards/energie.json";
import santeCards from "./cards/sante.json";
import socialCards from "./cards/social.json";
import educationCards from "./cards/education.json";
import securiteCards from "./cards/securite.json";
import etatCards from "./cards/etat.json";
import cultureCards from "./cards/culture.json";
import agricultureCards from "./cards/agriculture.json";
import logementCards from "./cards/logement.json";
import immigrationCards from "./cards/immigration.json";
import numeriqueCards from "./cards/numerique.json";
import recettesCards from "./cards/recettes.json";
import emploiCards from "./cards/emploi.json";
import environnementCards from "./cards/environnement.json";
import collectivitesCards from "./cards/collectivites.json";
import franceEuropeCards from "./cards/france-europe.json";
import zombiesCards from "./cards/zombies.json";
import ukraineCards from "./cards/ukraine.json";

const allCards: Card[] = [
  ...defenseCards,
  ...energieCards,
  ...santeCards,
  ...socialCards,
  ...educationCards,
  ...securiteCards,
  ...etatCards,
  ...cultureCards,
  ...agricultureCards,
  ...logementCards,
  ...immigrationCards,
  ...numeriqueCards,
  ...recettesCards,
  ...emploiCards,
  ...environnementCards,
  ...collectivitesCards,
  ...franceEuropeCards,
  ...zombiesCards,
  ...ukraineCards,
] as Card[];

const decksData: { decks: Deck[]; cards: Card[] } = {
  decks: decksMeta.decks as Deck[],
  cards: allCards,
};

export default decksData;
