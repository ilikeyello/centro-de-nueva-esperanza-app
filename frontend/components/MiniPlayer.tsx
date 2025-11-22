import { usePlayer } from "../contexts/PlayerContext";
import { X, Minimize2, Maximize2 } from "lucide-react";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isMinimized,
    pauseTrack,
    playTrack,
    toggleMinimize,
    closePlayer,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 rounded-lg border border-blue-400 bg-black shadow-2xl transition-all duration-300 md:bottom-4 ${
        isMinimized ? "w-72" : "h-64 w-96 max-w-[90vw]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-800 p-3">
        <span className="text-sm font-semibold text-white">Now Playing</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleMinimize}
            className="text-gray-400 transition hover:text-blue-400"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={closePlayer}
            className="text-gray-400 transition hover:text-blue-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={isMinimized ? "hidden" : "block"}>
        <iframe
          src={currentTrack}
          title="YouTube player"
          className="h-[180px] w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}
