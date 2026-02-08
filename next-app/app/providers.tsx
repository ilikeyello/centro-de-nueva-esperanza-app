"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { LanguageProvider } from "../contexts/LanguageContext";
import { PlayerProvider } from "../contexts/PlayerContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { Toaster } from "../components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <PlayerProvider>
          <NotificationProvider>
            <div className="dark">
              {children}
              <Toaster />
            </div>
          </NotificationProvider>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
