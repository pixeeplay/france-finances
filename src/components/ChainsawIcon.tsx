import Image from "next/image";

interface ChainsawIconProps {
  size?: number;
  className?: string;
}

export function ChainsawIcon({ size = 24, className }: ChainsawIconProps) {
  return (
    <Image
      src="/chainsaw.svg"
      alt=""
      width={size}
      height={size}
      className={`chainsaw-icon ${className ?? ""}`}
    />
  );
}
