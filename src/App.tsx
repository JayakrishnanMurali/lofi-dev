import { useEffect } from 'react';
import './index.css';

import { usePlayerStore } from './store/playerStore';
import { useAudio } from './hooks/useAudio';
import { useKeyboard } from './hooks/useKeyboard';

import { AnimatedBackground } from './components/Background/AnimatedBackground';
import { Player } from './components/Player/Player';
import { Playlist } from './components/Playlist/Playlist';
import { Search } from './components/Search/Search';
import { AmbientMixer } from './components/AmbientMixer/AmbientMixer';

import { Search as SearchIcon, Radio } from 'lucide-react';
import type { Track } from './shared/types';

function NowPlayingHero() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div
          className="w-40 h-40 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Radio size={48} style={{ color: 'rgba(240,234,248,0.2)' }} />
        </div>
        <p className="text-sm" style={{ color: 'rgba(240,234,248,0.35)' }}>
          Select a track to start listening
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8">
      {/* Large album art */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000"
        style={{
          width: 'min(300px, 60vw)',
          height: 'min(300px, 60vw)',
          boxShadow: `0 30px 100px var(--accent-primary, rgba(139,92,246,0.35)), 0 0 0 1px rgba(255,255,255,0.08)`,
          transform: status === 'playing' ? 'scale(1)' : 'scale(0.96)',
        }}
      >
        <img
          src={`/api/thumbnail/${currentTrack.id}`}
          alt={currentTrack.title}
          className="w-full h-full object-cover transition-all duration-700"
          style={{ filter: status === 'playing' ? 'brightness(1)' : 'brightness(0.7)' }}
        />

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Now playing bars indicator */}
        {status === 'playing' && (
          <div
            className="absolute bottom-3 right-3 flex items-end gap-0.5"
            style={{ height: '16px' }}
          >
            {[1, 2, 3, 4].map((barIndex) => (
              <div
                key={barIndex}
                className="w-1 rounded-full"
                style={{
                  background: 'white',
                  animation: `nowPlayingBar ${0.6 + barIndex * 0.15}s ease-in-out infinite alternate`,
                  height: `${40 + barIndex * 15}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="text-center max-w-sm">
        <h1
          className="text-xl font-semibold leading-tight mb-1 line-clamp-2"
          style={{ color: 'rgba(240,234,248,0.95)' }}
        >
          {currentTrack.title}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(240,234,248,0.5)' }}>
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

  // Load initial lofi tracks on mount
  useEffect(() => {
    async function loadInitialTracks() {
      try {
        const response = await fetch('/api/popular');
        if (!response.ok) return;
        const tracks = await response.json() as Track[];
        if (tracks.length > 0) {
          setQueue(tracks, 0);
        }
      } catch (err) {
        console.error('Failed to load initial tracks:', err);
      }
    }

    loadInitialTracks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ color: 'rgba(240,234,248,0.9)' }}>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10, 10, 20, 0.6)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary, rgba(139,92,246,0.9)), var(--accent-secondary, rgba(219,39,119,0.7)))',
            }}
          >
            🎵
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'rgba(240,234,248,0.9)' }}>
            lofi.dev
          </span>
        </div>

        {/* Search button */}
        <button
          onClick={toggleSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-150 hover:bg-white/10"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(240,234,248,0.6)',
          }}
          aria-label="Search"
          title="Search (/ or Ctrl+K)"
        >
          <SearchIcon size={14} />
          <span className="hidden sm:inline">Search tracks</span>
          <kbd
            className="hidden sm:inline text-xs px-1 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,234,248,0.35)' }}
          >
            /
          </kbd>
        </button>
      </header>

      {/* Main content */}
      <main
        className="flex flex-1 pt-16 pb-36"
        style={{ marginRight: isPlaylistOpen ? '320px' : '0', transition: 'margin-right 0.3s ease' }}
      >
        <NowPlayingHero />
      </main>

      {/* Sidebar playlist */}
      <Playlist />

      {/* Bottom player bar */}
      <Player onSeek={seek} />

      {/* Floating panels */}
      <AmbientMixer />

      {/* Search overlay */}
      <Search />
    </div>
  );
}

export default App;
