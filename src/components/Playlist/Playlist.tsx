import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { TrackItem } from './TrackItem';
import { Loader, Music2 } from 'lucide-react';

export function Playlist() {
  const queue = usePlayerStore((state) => state.queue);
  const queueIndex = usePlayerStore((state) => state.queueIndex);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Scroll active track into view
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [queueIndex]);

  if (!isPlaylistOpen) return null;

  return (
    <aside
      className="fixed right-0 top-0 bottom-[140px] w-80 z-40 flex flex-col"
      style={{
        background: 'rgba(10, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Music2 size={16} style={{ color: 'var(--accent-primary, rgba(139,92,246,0.9))' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'rgba(240,234,248,0.9)' }}>
          Queue
        </h2>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,234,248,0.5)' }}
        >
          {queue.length} tracks
        </span>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader size={24} className="animate-spin" style={{ color: 'rgba(240,234,248,0.3)' }} />
            <p className="text-sm" style={{ color: 'rgba(240,234,248,0.4)' }}>Loading tracks…</p>
          </div>
        ) : (
          queue.map((track, index) => (
            <div
              key={`${track.id}-${index}`}
              ref={index === queueIndex ? activeItemRef : undefined}
            >
              <TrackItem
                track={track}
                index={index}
                isActive={index === queueIndex}
              />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
