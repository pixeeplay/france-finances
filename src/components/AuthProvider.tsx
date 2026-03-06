"use client";

import { SessionProvider } from "next-auth/react";
import { SyncProvider } from "@/components/SyncProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SyncProvider />
      {children}
    </SessionProvider>
  );
}
