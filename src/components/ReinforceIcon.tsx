import Image from "next/image";

interface ReinforceIconProps {
  size?: number;
  className?: string;
}

export function ReinforceIcon({ size = 24, className }: ReinforceIconProps) {
  return (
    <Image
      src="/renforcer.svg"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
