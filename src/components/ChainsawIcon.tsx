import Image from "next/image";

interface ChainsawIconProps {
  size?: number;
  className?: string;
  /** red = couper / à revoir, orange = réduire (niv. 2), white = sur un bouton plein */
  variant?: "red" | "orange" | "white";
}

const FILTER_CLASS: Record<NonNullable<ChainsawIconProps["variant"]>, string> = {
  red: "chainsaw-icon",
  orange: "chainsaw-icon-orange",
  white: "brightness-0 invert",
};

export function ChainsawIcon({ size = 24, className, variant = "red" }: ChainsawIconProps) {
  return (
    <Image
      src="/chainsaw.svg"
      alt=""
      width={size}
      height={size}
      className={`${FILTER_CLASS[variant]} ${className ?? ""}`}
    />
  );
}
