import { Play, Volume2 } from 'lucide-react';
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
  const status = usePlayerStore((state) => state.status);
  const isPlaying = isActive && status === 'playing';

  return (
    <button
      onClick={() => playAtIndex(index)}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-150 group"
      style={{
        background: isActive ? 'rgba(167,139,250,0.12)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(167,139,250,0.25)' : 'transparent'}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
      aria-label={`Play ${track.title}`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-9 h-9 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <img
          src={`/api/thumbnail/${track.id}`}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <Play size={12} fill="white" style={{ color: 'white' }} />
        </div>
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate leading-snug"
          style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
        >
          {track.title}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {track.author}
        </p>
      </div>

      {/* Right side */}
      <div className="shrink-0 flex items-center gap-1.5">
        {isPlaying && (
          <Volume2 size={11} style={{ color: 'rgba(255,255,255,0.65)' }} />
        )}
        <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {formatDuration(track.duration)}
        </span>
      </div>
    </button>
  );
}
