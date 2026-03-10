import { useRef, useCallback } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export function VolumeControl() {
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setMuted = usePlayerStore((state) => state.setMuted);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const VolumeIcon =
    muted || volume === 0
      ? VolumeX
      : volume < 0.3
      ? Volume
      : volume < 0.7
      ? Volume1
      : Volume2;

  const seekVolume = useCallback((event: React.PointerEvent | PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setVolume(fraction);
    if (fraction > 0 && muted) setMuted(false);
  }, [setVolume, setMuted, muted]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    isDraggingRef.current = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    seekVolume(event);
  }, [seekVolume]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    seekVolume(event);
  }, [seekVolume]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const displayVolume = muted ? 0 : volume;

  return (
    <div className="flex items-center gap-2 group" style={{ minWidth: '120px' }}>
      <button
        onClick={() => setMuted(!muted)}
        className="transition-colors duration-150 hover:text-white"
        style={{ color: 'rgba(240,234,248,0.6)' }}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={16} />
      </button>

      <div
        ref={trackRef}
        className="relative flex-1 h-1 rounded-full cursor-pointer group-hover:h-[5px] transition-all duration-150"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${displayVolume * 100}%`,
            background: 'rgba(240,234,248,0.7)',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white"
          style={{ left: `${displayVolume * 100}%` }}
        />
      </div>
    </div>
  );
}
