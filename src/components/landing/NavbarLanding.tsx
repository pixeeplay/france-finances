import { hasVisibleDossiers } from "@/lib/dossiers";
import { NavbarLandingClient } from "./NavbarLandingClient";

/**
 * Barre de navigation du site (composant serveur). La présence de dossiers
 * publiés est évaluée ici, pour que le catalogue des dossiers (brouillons
 * compris) n'entre jamais dans le JS envoyé au navigateur.
 */
export function NavbarLanding() {
  return <NavbarLandingClient dossiersVisible={hasVisibleDossiers()} />;
}
