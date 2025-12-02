import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";
import { Home } from "./pages/Home";
import { News } from "./pages/News";
import { BulletinBoard } from "./pages/BulletinBoard";
import { Donations } from "./pages/Donations";
import { Media } from "./pages/Media";
import { Games } from "./pages/Games";
import { TriviaGamePage } from "./pages/TriviaGamePage";
import { Contact } from "./pages/Contact";
import { NewHere } from "./pages/NewHere";
import { AdminUpload } from "./pages/AdminUpload";
import { NotificationSettings } from "./notifications/NotificationSettings";
import { PushNotificationPrompt } from "./PushNotificationPrompt";
import { Toaster } from "@/components/ui/toaster";

type Page =
  | "home"
  | "media"
  | "bulletin"
  | "news"
  | "donations"
  | "contact"
  | "games"
  | "triviaGame"
  | "newHere"
  | "adminUpload"
  | "notifications";

export function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Allow direct navigation to the hidden admin upload page via URL hash.
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === "#admin-upload") {
      setCurrentPage("adminUpload");
    } else if (path === "/trivia-game" || hash === "#trivia-game") {
      setCurrentPage("triviaGame");
    } else if (hash === "#media") {
      // Open Media (livestream) page from notification
      setCurrentPage("media");
    } else if (hash === "#news" || hash === "#news-announcements" || hash === "#news-events") {
      // Open News page from notification; tab selection is handled inside News.tsx
      setCurrentPage("news");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="pb-24 md:pb-20">
        {currentPage === "home" && <Home onNavigate={handleNavigate} />}
        {currentPage === "bulletin" && <BulletinBoard />}
        {currentPage === "news" && <News />}
        {currentPage === "donations" && <Donations onNavigate={handleNavigate} />}
        <div className={currentPage === "media" ? "block" : "hidden"}>
          <Media />
        </div>
        {currentPage === "adminUpload" && <AdminUpload />}
        {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
        {currentPage === "games" && <Games onNavigate={handleNavigate} />}
        {currentPage === "triviaGame" && <TriviaGamePage onNavigate={handleNavigate} />}
        {currentPage === "newHere" && <NewHere onNavigate={handleNavigate} />}
        {currentPage === "notifications" && <NotificationSettings />}
      </main>
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
        <PushNotificationPrompt />
      </div>
      <Toaster />
    </div>
  );
}
