import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";
import { Home } from "./pages/Home";
import { News } from "./pages/News";
import { BulletinBoard } from "./pages/BulletinBoard";
import { Donations } from "./pages/Donations";
import { Media } from "./pages/Media";
import { Games } from "./pages/Games";
import { Contact } from "./pages/Contact";
import { NewHere } from "./pages/NewHere";
import { AdminUpload } from "./pages/AdminUpload";
import { Toaster } from "@/components/ui/toaster";

type Page =
  | "home"
  | "media"
  | "bulletin"
  | "news"
  | "donations"
  | "contact"
  | "games"
  | "newHere"
  | "adminUpload";

export function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  // Allow direct navigation to the hidden admin upload page via URL hash.
  useEffect(() => {
    if (window.location.hash === "#admin-upload") {
      setCurrentPage("adminUpload");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="pb-32 md:pb-24">
        {currentPage === "home" && <Home onNavigate={handleNavigate} />}
        {currentPage === "bulletin" && <BulletinBoard />}
        {currentPage === "news" && <News />}
        {currentPage === "donations" && <Donations onNavigate={handleNavigate} />}
        <div className={currentPage === "media" ? "block" : "hidden"}>
          <Media />
        </div>
        {currentPage === "adminUpload" && <AdminUpload />}
        {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
        {currentPage === "games" && <Games />}
        {currentPage === "newHere" && <NewHere onNavigate={handleNavigate} />}
      </main>
      <Toaster />
    </div>
  );
}
