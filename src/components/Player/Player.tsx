import { useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useColorExtract } from '../../hooks/useColorExtract';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import { List, Timer, Wind } from 'lucide-react';

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
      className="flex items-center gap-1 text-xs transition-colors duration-150"
      style={{
        color: sleepTimerMinutes !== null ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.5)',
      }}
      title="Sleep timer"
      aria-label="Sleep timer"
    >
      <Timer size={15} />
      {remainingMinutes !== null && (
        <span className="tabular-nums">{remainingMinutes}m</span>
      )}
    </button>
  );
}

export function Player({ onSeek }: PlayerProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const isAmbientOpen = usePlayerStore((state) => state.isAmbientOpen);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const togglePlaylist = usePlayerStore((state) => state.togglePlaylist);
  const toggleAmbient = usePlayerStore((state) => state.toggleAmbient);
  const issuePlaybackCommand = usePlayerStore((state) => state.issuePlaybackCommand);
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer);
  const { extractColors } = useColorExtract();

  // Extract colors when track changes
  useEffect(() => {
    if (currentTrack?.thumbnailUrl) {
      extractColors(currentTrack.thumbnailUrl);
    }
  }, [currentTrack?.id]);

  // Sleep timer countdown
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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
      style={{
        background: 'rgba(10, 10, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >

      {/* Progress */}
      <ProgressBar onSeek={onSeek} />

      <div className="flex items-center justify-between mt-3">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentTrack ? (
            <>
              <div
                className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden"
                style={{ boxShadow: '0 0 12px var(--accent-primary, rgba(139,92,246,0.3))' }}
              >
                <img
                  src={`/api/thumbnail/${currentTrack.id}`}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'rgba(240,234,248,0.95)' }}
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'rgba(240,234,248,0.5)' }}>
                  {currentTrack.author}
                </p>
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: 'rgba(240,234,248,0.4)' }}>
              No track selected
            </div>
          )}
        </div>

        {/* Center controls */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 mx-4">
          <PlayerControls onSeek={onSeek} />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <VolumeControl />

          <div className="w-px h-4 bg-white/10" />

          <SleepTimerButton />

          <button
            onClick={toggleAmbient}
            className="transition-colors duration-150 hover:text-white"
            style={{
              color: isAmbientOpen ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.5)',
            }}
            title="Ambient sounds"
            aria-label="Toggle ambient mixer"
          >
            <Wind size={16} />
          </button>

          <button
            onClick={togglePlaylist}
            className="transition-colors duration-150 hover:text-white"
            style={{
              color: isPlaylistOpen ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.5)',
            }}
            title="Playlist"
            aria-label="Toggle playlist"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
