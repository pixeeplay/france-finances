import Image from "next/image";

/** Logo texte : drapeau tricolore + « france-finances.com » (.com en rouge). */
export function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const flag = size === "md" ? 28 : 22;
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/france.svg" alt="" width={flag} height={flag} aria-hidden="true" />
      <span className={`font-heading font-extrabold tracking-tight text-brand-fg dark:text-foreground ${size === "md" ? "text-lg" : "text-base"}`}>
        france-finances<span className="text-danger">.com</span>
      </span>
    </span>
  );
}
