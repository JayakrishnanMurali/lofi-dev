import { Play, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { Track } from '../../shared/types';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds === 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackItem({ track, index, isActive }: TrackItemProps) {
  const playAtIndex = usePlayerStore((state) => state.playAtIndex);

  return (
    <button
      onClick={() => playAtIndex(index)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 group"
      style={{
        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
      aria-label={`Play ${track.title}`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-white/5">
        <img
          src={`/api/thumbnail/${track.id}`}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          {isActive ? (
            <Music size={14} style={{ color: 'var(--accent-primary, rgba(139,92,246,1))' }} />
          ) : (
            <Play size={14} fill="white" style={{ color: 'white' }} />
          )}
        </div>
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate leading-tight"
          style={{
            color: isActive ? 'var(--accent-primary, rgba(139,92,246,1))' : 'rgba(240,234,248,0.9)',
          }}
        >
          {track.title}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(240,234,248,0.45)' }}>
          {track.author}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'rgba(240,234,248,0.35)' }}>
        {formatDuration(track.duration)}
      </span>
    </button>
  );
}
