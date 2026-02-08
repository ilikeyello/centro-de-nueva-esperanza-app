"use client";

import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      <main className="pb-24 md:pb-20">{children}</main>
    </div>
  );
}
