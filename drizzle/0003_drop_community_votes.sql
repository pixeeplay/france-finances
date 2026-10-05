-- Suppression de community_votes : table jamais alimentee.
-- Le pourcentage communautaire est calcule directement depuis la table votes
-- (src/app/api/community) ; aucun code n'ecrit ni ne lit community_votes.
-- IF EXISTS : la table peut ne pas exister (base creee via db:push).
DROP TABLE IF EXISTS "community_votes";
