import { useEffect, useRef, useState, useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { TrackItem } from './TrackItem';
import { Loader, Radio, Heart, ListMusic, Search, X } from 'lucide-react';
import type { Track } from '../../shared/types';

type Tab = 'queue' | 'radio' | 'favorites';

const RADIO_STATIONS: { id: string; label: string; emoji: string; query: string; description: string }[] = [
  { id: 'study',   label: 'Study',       emoji: '📚', query: 'lofi hip hop study beats focus', description: 'Focus & concentrate' },
  { id: 'night',   label: 'Late Night',  emoji: '🌙', query: 'lofi hip hop late night chill', description: 'Midnight vibes' },
  { id: 'coding',  label: 'Coding',      emoji: '💻', query: 'lofi beats coding deep work programming', description: 'Deep work mode' },
  { id: 'sleep',   label: 'Sleep',       emoji: '😴', query: 'lofi sleep music relaxing calm', description: 'Wind down & rest' },
  { id: 'jazz',    label: 'Jazz',        emoji: '🎷', query: 'lofi jazz cafe smooth instrumental', description: 'Smooth & mellow' },
  { id: 'nature',  label: 'Nature',      emoji: '🌿', query: 'lofi nature ambient forest sounds', description: 'Earthy & organic' },
];

function RadioTab() {
  const setQueue = usePlayerStore((state) => state.setQueue);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadStation(station: typeof RADIO_STATIONS[number]) {
    setLoadingId(station.id);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(station.query)}`);
      if (!response.ok) throw new Error('Failed');
      const tracks = await response.json() as Track[];
      if (tracks.length > 0) setQueue(tracks, 0);
    } catch (err) {
      console.error('Station load error:', err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs px-1 mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
        Tap a station to instantly load curated tracks
      </p>
      {RADIO_STATIONS.map((station) => (
        <button
          key={station.id}
          onClick={() => loadStation(station)}
          disabled={loadingId === station.id}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group disabled:opacity-60"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
        >
          <span className="text-xl w-8 text-center shrink-0">{station.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.88)' }}>{station.label}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{station.description}</p>
          </div>
          {loadingId === station.id
            ? <Loader size={14} className="animate-spin shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
            : <Radio size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(255,255,255,0.4)' }} />
          }
        </button>
      ))}
    </div>
  );
}

function FavoritesTab() {
  const favorites = usePlayerStore((state) => state.favorites);
  const setQueue = usePlayerStore((state) => state.setQueue);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
        <Heart size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
        <p className="text-xs text-center px-6" style={{ color: 'rgba(255,255,255,0.32)' }}>
          Heart tracks to save them here
        </p>
      </div>
    );
  }

  return (
    <div className="py-1 px-2 space-y-0.5">
      {favorites.map((track, index) => (
        <TrackItem
          key={track.id}
          track={track}
          index={index}
          isActive={false}
          onPlay={() => setQueue([...favorites], index)}
        />
      ))}
    </div>
  );
}

export function Playlist() {
  const queue = usePlayerStore((state) => state.queue);
  const queueIndex = usePlayerStore((state) => state.queueIndex);
  const isPlaylistOpen = usePlayerStore((state) => state.isPlaylistOpen);
  const togglePlaylist = usePlayerStore((state) => state.togglePlaylist);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (tab === 'queue' && !searchQuery) {
      activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [queueIndex, tab, searchQuery]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue.map((track, i) => ({ track, originalIndex: i }));
    const q = searchQuery.toLowerCase();
    return queue
      .map((track, i) => ({ track, originalIndex: i }))
      .filter(({ track }) => track.title.toLowerCase().includes(q) || track.author.toLowerCase().includes(q));
  }, [queue, searchQuery]);

  if (!isPlaylistOpen) return null;

  const TAB_ITEMS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'queue',     icon: <ListMusic size={13} />, label: 'Queue' },
    { id: 'radio',     icon: <Radio size={13} />,     label: 'Radio' },
    { id: 'favorites', icon: <Heart size={13} />,     label: 'Liked' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={togglePlaylist} />

      <aside
        className="fixed right-0 top-0 z-40 flex flex-col"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
          width: 'min(320px, 100vw)',
          background: 'rgba(8, 8, 12, 0.95)',
          backdropFilter: 'blur(28px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {tab === 'queue' ? 'Queue' : tab === 'radio' ? 'Radio' : 'Liked'}
          </span>
          {tab === 'queue' && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
              {queue.length}
            </span>
          )}
          <button onClick={togglePlaylist} className="ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-3 py-2 gap-1 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {TAB_ITEMS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === t.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Queue search */}
        {tab === 'queue' && (
          <div className="px-3 py-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Search size={12} style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter queue…"
                className="flex-1 bg-transparent text-xs outline-none min-w-0"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'rgba(255,255,255,0.28)' }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}>
          {tab === 'queue' && (
            <div className="py-1 px-2 space-y-0.5">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader size={20} className="animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading tracks…</p>
                </div>
              ) : filteredQueue.length === 0 ? (
                <p className="text-xs text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>No matches for "{searchQuery}"</p>
              ) : (
                filteredQueue.map(({ track, originalIndex }) => (
                  <div key={`${track.id}-${originalIndex}`} ref={originalIndex === queueIndex && !searchQuery ? activeItemRef : undefined}>
                    <TrackItem track={track} index={originalIndex} isActive={originalIndex === queueIndex} />
                  </div>
                ))
              )}
            </div>
          )}
          {tab === 'radio' && <RadioTab />}
          {tab === 'favorites' && <FavoritesTab />}
        </div>
      </aside>
    </>
  );
}
