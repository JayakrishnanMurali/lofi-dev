import { useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useColorExtract } from '../../hooks/useColorExtract';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import {
  List, Timer,
  Play, Pause, SkipForward, Loader
} from 'lucide-react';

interface PlayerProps {
  onSeek: (fraction: number) => void;
}

function SleepTimerButton() {
  const sleepTimerMinutes = usePlayerStore((state) => state.sleepTimerMinutes);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer);
  const TIMER_OPTIONS = [15, 30, 45, 60, 90];

  const remainingMinutes = sleepTimerEndsAt
    ? Math.max(0, Math.ceil((sleepTimerEndsAt - Date.now()) / 60000))
    : null;

  function cycleTimer() {
    if (sleepTimerMinutes === null) {
      setSleepTimer(30);
    } else {
      const currentIndex = TIMER_OPTIONS.indexOf(sleepTimerMinutes);
      const nextIndex = (currentIndex + 1) % (TIMER_OPTIONS.length + 1);
      const nextOption = TIMER_OPTIONS[nextIndex];
      setSleepTimer(nextIndex < TIMER_OPTIONS.length && nextOption !== undefined ? nextOption : null);
    }
  }

  return (
    <button
      onClick={cycleTimer}
      className="flex items-center gap-1 text-xs transition-colors duration-150 hover:text-white"
      style={{ color: sleepTimerMinutes !== null ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)' }}
      title="Sleep timer"
      aria-label="Sleep timer"
    >
      <Timer size={15} />
      {remainingMinutes !== null && (
        <span className="tabular-nums font-medium">{remainingMinutes}m</span>
      )}
    </button>
  );
}

// ─── iOS-style compact mobile bar ────────────────────────────────────────────
function MobilePlayerBar({ onSeek: _onSeek }: { onSeek: (f: number) => void }) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const progressFraction = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const issuePlaybackCommand = usePlayerStore((state) => state.issuePlaybackCommand);
  const playNext = usePlayerStore((state) => state.playNext);
  const togglePlaylist = usePlayerStore((state) => state.togglePlaylist);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(7, 7, 16, 0.96)',
        backdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Slim progress bar — no text, tappable */}
      <div className="h-1 w-full cursor-pointer" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full transition-[width] duration-500 ease-linear"
          style={{ width: `${progressFraction * 100}%`, background: 'rgba(255,255,255,0.85)' }}
        />
      </div>

      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Thumbnail */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          {currentTrack && (
            <img
              src={`/api/thumbnail/${currentTrack.id}`}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Title & artist — scrolling marquee feel via truncate */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: currentTrack ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)' }}
          >
            {currentTrack?.title ?? 'Nothing playing'}
          </p>
          {currentTrack && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {currentTrack.author}
            </p>
          )}
        </div>

        {/* Compact controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => issuePlaybackCommand(isPlaying ? 'pause' : 'play')}
            disabled={!currentTrack || isLoading}
            className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading
              ? <Loader size={20} className="animate-spin" />
              : isPlaying
              ? <Pause size={20} fill="currentColor" />
              : <Play size={20} fill="currentColor" className="translate-x-px" />}
          </button>

          <button
            onClick={playNext}
            disabled={!currentTrack}
            className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 disabled:opacity-30"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            aria-label="Next track"
          >
            <SkipForward size={22} />
          </button>

          <button
            onClick={togglePlaylist}
            className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-150"
            style={{ color: isPlaylistOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)' }}
            aria-label="Toggle playlist"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Full desktop bar ─────────────────────────────────────────────────────────
function DesktopPlayerBar({ onSeek }: { onSeek: (f: number) => void }) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const togglePlaylist = usePlayerStore((state) => state.togglePlaylist);
  const issuePlaybackCommand = usePlayerStore((state) => state.issuePlaybackCommand);
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer);

  const activeIconColor = 'rgba(255,255,255,0.92)';
  const inactiveIconColor = 'rgba(255,255,255,0.38)';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 pt-2 pb-3"
      style={{
        background: 'rgba(7, 7, 16, 0.92)',
        backdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <ProgressBar onSeek={onSeek} />

      <div className="flex items-center gap-3 mt-3">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentTrack ? (
            <>
              <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden">
                <img src={`/api/thumbnail/${currentTrack.id}`} alt={currentTrack.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.92)' }} title={currentTrack.title}>
                  {currentTrack.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  {currentTrack.author}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No track selected</p>
          )}
        </div>

        {/* Center controls */}
        <div className="shrink-0 mx-4">
          <PlayerControls onSeek={onSeek} />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <VolumeControl />
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <SleepTimerButton />

          <button
            onClick={togglePlaylist}
            className="relative transition-all duration-150 hover:text-white"
            style={{ color: isPlaylistOpen ? activeIconColor : inactiveIconColor }}
            title="Playlist"
            aria-label="Toggle playlist"
          >
            <List size={16} />
            {isPlaylistOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.6)' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Player({ onSeek }: PlayerProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const issuePlaybackCommand = usePlayerStore((state) => state.issuePlaybackCommand);
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer);
  const { extractColors } = useColorExtract();

  useEffect(() => {
    if (currentTrack?.thumbnailUrl) extractColors(currentTrack.thumbnailUrl);
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!sleepTimerEndsAt) return;
    const interval = setInterval(() => {
      if (Date.now() >= sleepTimerEndsAt) {
        issuePlaybackCommand('pause');
        setSleepTimer(null);
        clearInterval(interval);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [sleepTimerEndsAt]);

  return (
    <>
      {/* Mobile — shown below md */}
      <div className="md:hidden">
        <MobilePlayerBar onSeek={onSeek} />
      </div>
      {/* Desktop — shown md and above */}
      <div className="hidden md:block">
        <DesktopPlayerBar onSeek={onSeek} />
      </div>
    </>
  );
}
