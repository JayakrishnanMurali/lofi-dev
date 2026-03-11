import { Play, Volume2, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { Track } from '../../shared/types';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  onPlay?: () => void; // optional override (used by Favorites tab)
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds === 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackItem({ track, index, isActive, onPlay }: TrackItemProps) {
  const playAtIndex = usePlayerStore((state) => state.playAtIndex);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);
  const favorites = usePlayerStore((state) => state.favorites);
  const status = usePlayerStore((state) => state.status);

  const isPlaying = isActive && status === 'playing';
  const isFavorited = favorites.some((f) => f.id === track.id);

  function handlePlay() {
    if (onPlay) onPlay();
    else playAtIndex(index);
  }

  return (
    <div
      className="group flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150"
      style={{
        background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
      }}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {/* Thumbnail — click to play */}
      <button
        onClick={handlePlay}
        className="relative shrink-0 w-9 h-9 rounded-lg overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        aria-label={`Play ${track.title}`}
      >
        <img
          src={`/api/thumbnail/${track.id}`}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <Play size={12} fill="white" style={{ color: 'white' }} />
        </div>
      </button>

      {/* Track info — click to play */}
      <button onClick={handlePlay} className="flex-1 min-w-0 text-left">
        <p className="text-xs font-medium truncate leading-snug" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.72)' }}>
          {track.title}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
          {track.author}
        </p>
      </button>

      {/* Right side */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Heart button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
          className="transition-all duration-150 opacity-0 group-hover:opacity-100"
          style={{ color: isFavorited ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={12} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {isPlaying
          ? <Volume2 size={11} style={{ color: 'rgba(255,255,255,0.55)' }} />
          : <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatDuration(track.duration)}</span>
        }
      </div>
    </div>
  );
}
