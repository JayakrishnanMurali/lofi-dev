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

  return (
    <div className="flex items-center gap-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 disabled:opacity-30"
        style={{ color: shuffled ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.5)' }}
        aria-label="Toggle shuffle"
        title="Shuffle (Ctrl+S)"
      >
        <Shuffle size={16} />
      </button>

      {/* Previous */}
      <button
        onClick={playPrevious}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 disabled:opacity-30"
        style={{ color: 'rgba(240,234,248,0.8)' }}
        aria-label="Previous track"
        title="Previous (Shift+←)"
      >
        <SkipBack size={20} />
      </button>

      {/* Play / Pause */}
      <button
        onClick={() => issuePlaybackCommand(isPlaying ? 'pause' : 'play')}
        disabled={isDisabled || isLoading}
        className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary, rgba(139,92,246,0.9)), var(--accent-secondary, rgba(219,39,119,0.7)))',
          boxShadow: '0 0 20px var(--accent-primary, rgba(139,92,246,0.4))',
          color: 'white',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title="Play/Pause (Space)"
      >
        {isLoading ? (
          <Loader size={20} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="translate-x-0.5" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={playNext}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 disabled:opacity-30"
        style={{ color: 'rgba(240,234,248,0.8)' }}
        aria-label="Next track"
        title="Next (Shift+→)"
      >
        <SkipForward size={20} />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        disabled={isDisabled}
        className="transition-all duration-150 hover:scale-110 disabled:opacity-30"
        style={{
          color: repeatMode !== 'none' ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.5)',
        }}
        aria-label="Toggle repeat"
        title="Repeat (Ctrl+R)"
      >
        <RepeatIcon size={16} />
      </button>
    </div>
  );
}
