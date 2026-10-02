interface StopIconProps {
  size?: number;
  className?: string;
}

/**
 * Injustifié (geste vers le bas) : panneau octogonal au trait barré,
 * même famille graphique que ShieldIcon et ChainsawIcon. Couleur : rouge.
 */
export function StopIcon({ size = 24, className }: StopIconProps) {
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
      className={/\btext-/.test(className ?? "") ? className : `text-danger ${className ?? ""}`}
    >
      <path d="M8.2 2.5h7.6l5.7 5.7v7.6l-5.7 5.7H8.2l-5.7-5.7V8.2z" />
      <path d="M7.5 12h9" />
    </svg>
  );
}
