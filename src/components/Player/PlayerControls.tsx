import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerControlsProps {
  onSeek: (fraction: number) => void;
}

export function PlayerControls({ onSeek: _onSeek }: PlayerControlsProps) {
  const status = usePlayerStore((state) => state.status);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const shuffled = usePlayerStore((state) => state.shuffled);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  const issuePlaybackCommand = usePlayerStore((state) => state.issuePlaybackCommand);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isDisabled = !currentTrack;

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  // Active state: always white so it's visible regardless of accent color
  const activeColor = 'rgba(255,255,255,0.95)';
  const inactiveColor = 'rgba(255,255,255,0.38)';

  return (
    <div className="flex items-center gap-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        disabled={isDisabled}
        className="relative transition-all duration-150 hover:scale-110 disabled:opacity-25"
        style={{ color: shuffled ? activeColor : inactiveColor }}
        aria-label="Toggle shuffle"
        title="Shuffle (Ctrl+S)"
      >
        <Shuffle size={15} />
        {shuffled && (
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          />
        )}
      </button>

      {/* Previous */}
      <button
        onClick={playPrevious}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 hover:text-white disabled:opacity-25"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        aria-label="Previous track"
        title="Previous (Shift+←)"
      >
        <SkipBack size={20} />
      </button>

      {/* Play / Pause */}
      <button
        onClick={() => issuePlaybackCommand(isPlaying ? 'pause' : 'play')}
        disabled={isDisabled || isLoading}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30"
        style={{
          background: '#ffffff',
          boxShadow: '0 0 20px rgba(255,255,255,0.15)',
          color: '#0c0c0f',
          color: 'white',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title="Play/Pause (Space)"
      >
        {isLoading ? (
          <Loader size={18} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="translate-x-px" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={playNext}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 hover:text-white disabled:opacity-25"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        aria-label="Next track"
        title="Next (Shift+→)"
      >
        <SkipForward size={20} />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        disabled={isDisabled}
        className="relative transition-all duration-150 hover:scale-110 disabled:opacity-25"
        style={{ color: repeatMode !== 'none' ? activeColor : inactiveColor }}
        aria-label="Toggle repeat"
        title="Repeat (Ctrl+R)"
      >
        <RepeatIcon size={15} />
        {repeatMode !== 'none' && (
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          />
        )}
      </button>
    </div>
  );
}
