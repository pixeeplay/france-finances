/** Couleur de la barre système (meta theme-color) selon le thème, alignée sur --background. */
export const THEME_COLORS = {
  dark: "#0F172A",
  light: "#FFFFFF",
} as const;

/**
 * Applique le thème au document : classe `dark` (le color-scheme natif suit
 * via globals.css) et couleur de la barre système.
 */
export function applyTheme(dark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
}
