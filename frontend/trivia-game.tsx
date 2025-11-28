import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { TriviaGamePage } from "./components/pages/TriviaGamePage";

const queryClient = new QueryClient();

// Simple component that just renders the trivia game
function TriviaGameApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlayerProvider>
          <div className="dark">
            <TriviaGamePage />
          </div>
        </PlayerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TriviaGameApp />);
}
