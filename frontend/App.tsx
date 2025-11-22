import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { AppInner } from "./components/AppInner";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlayerProvider>
          <div className="dark">
            <AppInner />
          </div>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
