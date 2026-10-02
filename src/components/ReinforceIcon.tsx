interface ReinforceIconProps {
  size?: number;
  className?: string;
}

/**
 * Renforcer (geste vers le haut) : flèche montante au trait, même famille
 * graphique que ShieldIcon et ChainsawIcon. Couleur : bleu « renforcer ».
 */
export function ReinforceIcon({ size = 24, className }: ReinforceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={/\btext-/.test(className ?? "") ? className : `text-info ${className ?? ""}`}
    >
      <path d="M12 20V5" />
      <path d="M5.5 11.5 12 5l6.5 6.5" />
      <path d="M5 21h14" />
    </svg>
  );
}
