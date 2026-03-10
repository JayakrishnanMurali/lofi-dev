import { useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, X, Loader, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { Track } from '../../shared/types';

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function SearchResultCard({ track, onSelect }: { track: Track; onSelect: (track: Track) => void }) {
  return (
    <button
      onClick={() => onSelect(track)}
      className="flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all duration-150 group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
      }}
    >
      <div className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden">
        <img
          src={`/api/thumbnail/${track.id}`}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <Music size={18} style={{ color: 'white' }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'rgba(240,234,248,0.95)' }}>
          {track.title}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(240,234,248,0.5)' }}>
          {track.author}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(240,234,248,0.3)' }}>
          {formatDuration(track.duration)}
        </p>
      </div>
    </button>
  );
}

export function Search() {
  const isSearchOpen = usePlayerStore((state) => state.isSearchOpen);
  const searchQuery = usePlayerStore((state) => state.searchQuery);
  const searchResults = usePlayerStore((state) => state.searchResults);
  const isSearching = usePlayerStore((state) => state.isSearching);

  const setSearchQuery = usePlayerStore((state) => state.setSearchQuery);
  const setSearchResults = usePlayerStore((state) => state.setSearchResults);
  const setIsSearching = usePlayerStore((state) => state.setIsSearching);
  const toggleSearch = usePlayerStore((state) => state.toggleSearch);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json() as Track[];
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [setSearchResults, setIsSearching]);

  const handleQueryChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => performSearch(value), 400);
  }, [setSearchQuery, performSearch]);

  // Load all results into the queue and start playing the selected track immediately
  const handleTrackSelect = useCallback((track: Track) => {
    const allTracks = searchResults.length > 0 ? searchResults : [track];
    const startIndex = allTracks.findIndex((t) => t.id === track.id);
    setQueue(allTracks, startIndex >= 0 ? startIndex : 0);
    toggleSearch();
  }, [searchResults, setQueue, toggleSearch]);

  const handlePlayAll = useCallback(() => {
    if (searchResults.length === 0) return;
    setQueue(searchResults, 0);
    toggleSearch();
  }, [searchResults, setQueue, toggleSearch]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleSearch();
      }}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 28, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <SearchIcon size={18} style={{ color: 'rgba(240,234,248,0.4)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search lofi tracks, artists…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'rgba(240,234,248,0.9)' }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') toggleSearch();
              if (e.key === 'Enter' && searchResults.length > 0) handleTrackSelect(searchResults[0]);
            }}
          />
          {isSearching && <Loader size={16} className="animate-spin shrink-0" style={{ color: 'rgba(240,234,248,0.4)' }} />}
          <button onClick={toggleSearch} style={{ color: 'rgba(240,234,248,0.4)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {searchResults.length > 0 && (
            <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs" style={{ color: 'rgba(240,234,248,0.4)' }}>
                {searchResults.length} results
              </span>
              <button
                onClick={handlePlayAll}
                className="text-xs px-3 py-1 rounded-full transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.82)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                Play all
              </button>
            </div>
          )}

          <div className="p-3 space-y-2">
            {!searchQuery && (
              <p className="text-center py-8 text-sm" style={{ color: 'rgba(240,234,248,0.3)' }}>
                Search YouTube for lofi tracks
              </p>
            )}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: 'rgba(240,234,248,0.3)' }}>
                No results found
              </p>
            )}
            {searchResults.map((track) => (
              <SearchResultCard key={track.id} track={track} onSelect={handleTrackSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
