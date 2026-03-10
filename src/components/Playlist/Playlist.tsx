import { useEffect, useRef, useState, useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { TrackItem } from './TrackItem';
import { Loader, Music2, Search, X } from 'lucide-react';

export function Playlist() {
  const queue = usePlayerStore((state) => state.queue);
  const queueIndex = usePlayerStore((state) => state.queueIndex);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const togglePlaylist = usePlayerStore((state) => state.togglePlaylist);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!searchQuery) {
      activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [queueIndex, searchQuery]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue.map((track, originalIndex) => ({ track, originalIndex }));
    const q = searchQuery.toLowerCase();
    return queue
      .map((track, originalIndex) => ({ track, originalIndex }))
      .filter(({ track }) =>
        track.title.toLowerCase().includes(q) || track.author.toLowerCase().includes(q)
      );
  }, [queue, searchQuery]);

  if (!isPlaylistOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 md:hidden"
        onClick={togglePlaylist}
      />

      <aside
        className="fixed right-0 top-0 z-40 flex flex-col"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
          width: 'min(320px, 100vw)',
          background: 'rgba(8, 8, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Music2 size={14} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
          <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Playlist
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
          >
            {queue.length}
          </span>
          <button
            onClick={togglePlaylist}
            className="ml-auto transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            aria-label="Close playlist"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Search size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tracks…"
              className="flex-1 bg-transparent text-xs outline-none min-w-0"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'rgba(255,255,255,0.3)' }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Track list */}
        <div
          className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
        >
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <Loader size={22} className="animate-spin" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading tracks…</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No tracks match "{searchQuery}"</p>
            </div>
          ) : (
            filteredQueue.map(({ track, originalIndex }) => (
              <div
                key={`${track.id}-${originalIndex}`}
                ref={originalIndex === queueIndex && !searchQuery ? activeItemRef : undefined}
              >
                <TrackItem track={track} index={originalIndex} isActive={originalIndex === queueIndex} />
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
