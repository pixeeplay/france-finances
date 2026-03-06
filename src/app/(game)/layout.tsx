import { BottomNav } from "@/components/BottomNav";
import { SwUpdateToast } from "@/components/SwUpdateToast";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-dvh flex items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-md w-full min-h-dvh lg:min-h-0 lg:h-[900px] lg:max-h-[90vh] lg:rounded-3xl lg:border lg:border-border lg:shadow-2xl lg:overflow-hidden flex flex-col relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-bold"
        >
          Aller au contenu
        </a>
        <main id="main-content" className="flex flex-col flex-1 min-h-0">
          {children}
        </main>
        <BottomNav />
        <SwUpdateToast />
      </div>
    </div>
  );
}
