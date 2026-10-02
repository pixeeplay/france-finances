import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { Footer } from "@/components/landing/Footer";

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
