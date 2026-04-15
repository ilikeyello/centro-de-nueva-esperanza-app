import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";
import { Home } from "./pages/Home";
import { News } from "./pages/News";
import { BulletinBoard } from "./pages/BulletinBoard";
import { Donations } from "./pages/Donations";
import { Media } from "./pages/Media";
import { Games } from "./pages/Games";
import { TriviaGamePage } from "./pages/TriviaGamePage";
import { WordSearchGamePage } from "./pages/WordSearchGamePage";
import { GraveyardShiftGamePage } from "./pages/GraveyardShiftGamePage";
import { Contact } from "./pages/Contact";
import { NewHere } from "./pages/NewHere";
import { AdminUpload } from "./pages/AdminUpload";
import { Bible } from "./pages/Bible";
import { NotificationSettings } from "./notifications/NotificationSettings";
import { PushNotificationPrompt } from "./PushNotificationPrompt";
import { useNotificationChecker } from "../hooks/useNotificationChecker";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "../contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { usePlayer } from "../contexts/PlayerContext";


type Page =
  | "home"
  | "bible"
  | "media"
  | "bulletin"
  | "news"
  | "donations"
  | "contact"
  | "games"
  | "triviaGame"
  | "wordSearchGame"
  | "graveyardShiftGame"
  | "newHere"
  | "adminUpload"
  | "notifications";

export function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const { isLivestreamPlaying, setIsLivestreamTransitioning } = usePlayer();

  const handleNavigate = (page: string) => {
    // If we are currently on the media page and moving away while the stream is playing,
    // trigger the transition buffer INSTANTLY before the state update.
    if (currentPage === "media" && page !== "media" && isLivestreamPlaying) {
      console.log('AppInner: Triggering instant transition buffer for PIP');
      setIsLivestreamTransitioning(true);
      setTimeout(() => {
        setIsLivestreamTransitioning(false);
      }, 4000);
    }

    setCurrentPage(page as Page);
    // Instant scroll to top (no animation)
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  // Ensure scroll to top whenever currentPage changes (catches all entry points)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [currentPage]);

  // Initialize notification checker for PWA push notifications
  useNotificationChecker(5); // Check every 5 minutes

  // Allow direct navigation via URL hash (used by notification deep links on cold launch).
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === "#admin-upload") {
      setCurrentPage("adminUpload");
    } else if (path === "/trivia-game" || hash === "#trivia-game") {
      setCurrentPage("triviaGame");
    } else if (hash === "#media") {
      setCurrentPage("media");
    } else if (hash === "#news" || hash === "#news-announcements" || hash === "#news-events") {
      // Tab selection is handled inside News.tsx by reading the hash
      setCurrentPage("news");
    } else if (hash === "#bulletin") {
      setCurrentPage("bulletin");
    }
  }, []);

  // Handle navigate messages from the service worker (notification clicks when app is already open).
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "NAVIGATE") return;
      const hash: string = event.data.hash ?? "";
      if (hash === "#news-announcements" || hash === "#news" || hash === "#news-events") {
        window.location.hash = hash; // let News.tsx pick the right tab
        setCurrentPage("news");
      } else if (hash === "#media") {
        setCurrentPage("media");
      } else if (hash === "#bulletin") {
        setCurrentPage("bulletin");
      } else if (hash === "#admin-upload") {
        setCurrentPage("adminUpload");
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen warm-gradient">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className={cn("pb-24 md:pb-20", currentPage !== "home" && "md:pt-20")}>
          <Media key="media-player-root" isMediaPage={currentPage === "media"} />
          {currentPage === "home" && <Home onNavigate={handleNavigate} />}
          {currentPage === "bible" && <Bible onNavigate={handleNavigate} />}
          {currentPage === "bulletin" && <BulletinBoard onNavigate={handleNavigate} />}
          {currentPage === "news" && <News />}
          {currentPage === "donations" && <Donations onNavigate={handleNavigate} />}
          {currentPage === "adminUpload" && <AdminUpload />}
          {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
          {currentPage === "games" && <Games onNavigate={handleNavigate} />}        
          {currentPage === "triviaGame" && <TriviaGamePage onNavigate={handleNavigate} />}
          {currentPage === "wordSearchGame" && <WordSearchGamePage onNavigate={handleNavigate} />}
          {currentPage === "graveyardShiftGame" && <GraveyardShiftGamePage onNavigate={handleNavigate} />}
          {currentPage === "newHere" && <NewHere onNavigate={handleNavigate} />}
          {currentPage === "notifications" && <NotificationSettings />}
        </main>
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60]">
          <PushNotificationPrompt />
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
