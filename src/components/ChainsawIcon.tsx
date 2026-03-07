import Image from "next/image";

interface ChainsawIconProps {
  size?: number;
  className?: string;
  variant?: "red" | "orange";
}

export function ChainsawIcon({ size = 24, className, variant = "red" }: ChainsawIconProps) {
  const filterClass = variant === "orange" ? "chainsaw-icon-orange" : "chainsaw-icon";
  return (
    <Image
      src="/chainsaw.svg"
      alt=""
      width={size}
      height={size}
      className={`${filterClass} ${className ?? ""}`}
    />
  );
}
