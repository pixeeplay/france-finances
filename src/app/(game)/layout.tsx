import { BottomNav } from "@/components/BottomNav";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-dvh flex items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-md w-full min-h-dvh lg:min-h-0 lg:h-[900px] lg:max-h-[90vh] lg:rounded-3xl lg:border lg:border-border lg:shadow-2xl lg:overflow-hidden flex flex-col relative">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
