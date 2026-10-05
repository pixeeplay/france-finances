import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { UiIcon } from "./UiIcon";

/** Pictogramme d'une famille d'archétypes (SVG, pas d'emoji) */
export type ArchetypeFamilyIcon = "balance" | "chainsaw" | "shield" | "target" | "search";

/** Familles d'archétypes : regroupement affiché au classement et pictogramme de chaque archétype. */
export const ARCHETYPE_FAMILIES: { name: string; icon: ArchetypeFamilyIcon; ids: string[] }[] = [
  { name: "Équilibristes", icon: "balance", ids: ["equilibriste"] },
  { name: "Coupeurs", icon: "chainsaw", ids: ["austeritaire", "demolisseur", "liquidateur_en_chef", "tranchant", "bucheron"] },
  { name: "Gardiens", icon: "shield", ids: ["gardien", "conservateur", "investisseur_public", "protecteur"] },
  { name: "Stratèges", icon: "target", ids: ["chirurgien", "stratege", "reformateur", "optimisateur", "elagueur"] },
  { name: "Analystes", icon: "search", ids: ["sceptique", "auditeur_rigoureux", "speedrunner"] },
];

/** Famille d'un archétype, ou null s'il est inconnu (ou absent). */
export function archetypeFamilyIcon(archetypeId: string | null | undefined): ArchetypeFamilyIcon | null {
  if (!archetypeId) return null;
  return ARCHETYPE_FAMILIES.find((f) => f.ids.includes(archetypeId))?.icon ?? null;
}

interface FamilyIconProps {
  icon: ArchetypeFamilyIcon;
  size?: number;
  className?: string;
}

/** Pictogramme d'une famille. Décoratif (aria-hidden). */
export function FamilyIcon({ icon, size = 16, className = "text-muted-foreground" }: FamilyIconProps) {
  if (icon === "chainsaw") return <ChainsawIcon size={size} />;
  if (icon === "shield") return <ShieldIcon size={size} className="text-primary" />;
  return <UiIcon name={icon} size={size} className={className} />;
}

interface ArchetypeIconProps {
  /** Identifiant d'archétype (src/data/archetypes.json) ; absent = silhouette neutre. */
  archetypeId?: string | null;
  size?: number;
  className?: string;
}

/**
 * Pictogramme d'un archétype : celui de sa famille. Remplace l'emoji du champ
 * `icon` des données (conservé pour le partage texte). Décoratif (aria-hidden).
 */
export function ArchetypeIcon({ archetypeId, size = 20, className }: ArchetypeIconProps) {
  const family = archetypeFamilyIcon(archetypeId);
  if (!family) return <UiIcon name="user" size={size} className={className ?? "text-muted-foreground"} />;
  return <FamilyIcon icon={family} size={size} className={className} />;
}
