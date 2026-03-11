import { useEffect } from "react";
import "./index.css";

import { usePlayerStore } from "./store/playerStore";
import { useAudio } from "./hooks/useAudio";
import { useKeyboard } from "./hooks/useKeyboard";

import { AnimatedBackground } from "./components/Background/AnimatedBackground";
import { LofiScene } from "./components/Scenes/LofiScene";
import { ScenePicker } from "./components/Scenes/ScenePicker";

import { Player } from "./components/Player/Player";
import { Playlist } from "./components/Playlist/Playlist";
import { Search } from "./components/Search/Search";

import { Search as SearchIcon, Radio } from "lucide-react";
import type { Track } from "./shared/types";

function LogoMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="26" height="26" rx="7" fill="#111115" />
      <rect width="26" height="26" rx="7" fill="url(#g)" fillOpacity="0.15" />
      {/* Vinyl record */}
      <circle
        cx="12"
        cy="13"
        r="8"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx="12"
        cy="13"
        r="5"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="12" cy="13" r="2" fill="rgba(255,255,255,0.85)" />
      {/* Sound bars */}
      <rect
        x="21"
        y="10"
        width="2"
        height="6"
        rx="1"
        fill="rgba(255,255,255,0.7)"
      />
      <rect
        x="18"
        y="12"
        width="2"
        height="4"
        rx="1"
        fill="rgba(255,255,255,0.4)"
      />
      <defs>
        <linearGradient
          id="g"
          x1="0"
          y1="0"
          x2="26"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NowPlayingHero() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div
          className="w-36 h-36 rounded-3xl flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Radio size={40} style={{ color: "rgba(255,255,255,0.18)" }} />
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Select a track to start
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6">
      {/* Album art */}
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-700"
        style={{
          width: "min(280px, 72vw)",
          height: "min(280px, 72vw)",
          boxShadow:
            status === "playing"
              ? "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)"
              : "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          transform: status === "playing" ? "scale(1)" : "scale(0.96)",
        }}
      >
        <img
          src={`/api/thumbnail/${currentTrack.id}`}
          alt={currentTrack.title}
          className="w-full h-full object-cover"
          style={{
            filter: status === "playing" ? "brightness(1)" : "brightness(0.65)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.45))",
          }}
        />

        {/* Animated bars when playing */}
        {status === "playing" && (
          <div
            className="absolute bottom-3 right-3 flex items-end gap-0.5"
            style={{ height: "14px" }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  animation: `nowPlayingBar ${0.55 + i * 0.12}s ease-in-out infinite alternate`,
                  height: `${35 + i * 16}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="text-center max-w-xs w-full px-2">
        <h1
          className="text-lg font-semibold leading-snug mb-1 line-clamp-2"
          style={{ color: "#f5f5f7", letterSpacing: "-0.01em" }}
        >
          {currentTrack.title}
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.42)" }}>
          {currentTrack.author}
        </p>
      </div>
    </div>
  );
}

export function App() {
  const toggleSearch = usePlayerStore((state) => state.toggleSearch);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const { seek } = useAudio();
  useKeyboard(seek);

  useEffect(() => {
    async function loadInitialTracks() {
      try {
        const response = await fetch("/api/popular");
        if (!response.ok) return;
        const tracks = (await response.json()) as Track[];
        if (tracks.length > 0) setQueue(tracks, 0);
      } catch (err) {
        console.error("Failed to load initial tracks:", err);
      }
    }
    loadInitialTracks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <LofiScene />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(12,12,15,0.8)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <LogoMark />
          <span
            className="font-semibold text-sm tracking-tight"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            Lofies
          </span>
        </div>

        {/* Search */}
        <button
          onClick={toggleSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-150 shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.06)")
          }
          aria-label="Search"
          title="Search (/)"
        >
          <SearchIcon size={13} />
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd
            className="hidden sm:inline text-xs px-1 py-0.5 rounded"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.28)",
              fontFamily: "monospace",
            }}
          >
            /
          </kbd>
        </button>
      </header>

      {/* Main */}
      <main
        className="flex flex-1 pt-14 pb-24 md:pb-32"
        style={{
          marginRight: isPlaylistOpen ? "min(320px, 100vw)" : "0",
          transition: "margin-right 0.3s ease",
        }}
      >
        <NowPlayingHero />
      </main>

      <Playlist />
      <ScenePicker />
      <Player onSeek={seek} />
      <Search />
    </div>
  );
}

export default App;
