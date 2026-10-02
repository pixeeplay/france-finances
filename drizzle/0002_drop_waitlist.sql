-- Suppression de la waitlist (teaser "Paris", code mort).
-- La table n'a jamais ete creee par une migration suivie (ajoutee via db:push),
-- d'ou le IF EXISTS. ATTENTION : supprime definitivement les emails inscrits.
-- Exporter la table avant d'appliquer cette migration si ces donnees doivent etre conservees.
DROP TABLE IF EXISTS "waitlist";
