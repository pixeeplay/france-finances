"use client";

import { useEffect } from "react";
import { runMigrations } from "@/lib/storage-migration";

/** Runs once on app boot to migrate localStorage schema */
export function AppInit() {
  useEffect(() => {
    runMigrations();
  }, []);
  return null;
}
