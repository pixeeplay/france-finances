import Image from "next/image";

interface StopIconProps {
  size?: number;
  className?: string;
}

export function StopIcon({ size = 24, className }: StopIconProps) {
  return (
    <Image
      src="/arretez.svg"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
