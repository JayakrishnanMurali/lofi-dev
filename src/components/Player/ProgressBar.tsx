import { useRef, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface ProgressBarProps {
  onSeek: (fraction: number) => void;
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function ProgressBar({ onSeek }: ProgressBarProps) {
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const progressFraction = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const seekFromPointerEvent = useCallback((event: React.PointerEvent | PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    onSeek(fraction);
  }, [onSeek]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    isDraggingRef.current = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    seekFromPointerEvent(event);
  }, [seekFromPointerEvent]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    seekFromPointerEvent(event);
  }, [seekFromPointerEvent]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <div className="w-full flex items-center gap-3 group">
      <span className="text-xs tabular-nums" style={{ color: 'rgba(240,234,248,0.5)', minWidth: '2.5rem', textAlign: 'right' }}>
        {formatDuration(currentTime)}
      </span>

      <div
        ref={trackRef}
        className="relative flex-1 h-1 rounded-full cursor-pointer transition-all duration-150 group-hover:h-[5px]"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
          style={{
            width: `${progressFraction * 100}%`,
            background: 'linear-gradient(90deg, var(--accent-primary, rgba(139,92,246,0.9)), var(--accent-secondary, rgba(219,39,119,0.7)))',
          }}
        />

        {/* Scrubber handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{
            left: `${progressFraction * 100}%`,
            background: 'white',
            boxShadow: '0 0 6px rgba(0,0,0,0.4)',
          }}
        />
      </div>

      <span className="text-xs tabular-nums" style={{ color: 'rgba(240,234,248,0.5)', minWidth: '2.5rem' }}>
        {formatDuration(duration)}
      </span>
    </div>
  );
}
