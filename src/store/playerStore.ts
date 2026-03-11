import { create } from 'zustand';
import type { Track, RepeatMode, PlayerStatus, AmbientLayer, DominantColors, SceneType } from '../shared/types';

function loadFavorites(): Track[] {
  try {
    return JSON.parse(localStorage.getItem('lofi-favorites') ?? '[]');
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Track[]) {
  try {
    localStorage.setItem('lofi-favorites', JSON.stringify(favorites));
  } catch {}
}

interface PlayerStore {
  // Track state
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;

  // Playback state
  status: PlayerStatus;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  shuffled: boolean;
  shuffledIndices: number[];

  // UI state
  isPlaylistOpen: boolean;
  isAmbientOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: Track[];
  isSearching: boolean;

  // Visual state
  dominantColors: DominantColors;
  ambientLayers: AmbientLayer[];
  currentScene: SceneType;
  setScene: (scene: SceneType) => void;

  // Favorites
  favorites: Track[];
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;

  // Sleep timer
  sleepTimerMinutes: number | null;
  sleepTimerEndsAt: number | null;

  // Playback command — user-initiated play/pause requests consumed by the player hook.
  // YouTube callbacks update `status` directly (display only). This separates
  // the two directions so there is no feedback loop.
  playbackCommand: 'play' | 'pause' | null;
  issuePlaybackCommand: (command: 'play' | 'pause') => void;
  clearPlaybackCommand: () => void;

  // Actions
  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  playAtIndex: (index: number) => void;

  setStatus: (status: PlayerStatus) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

  togglePlaylist: () => void;
  toggleAmbient: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Track[]) => void;
  setIsSearching: (searching: boolean) => void;

  setDominantColors: (colors: DominantColors) => void;
  updateAmbientLayer: (id: string, changes: Partial<AmbientLayer>) => void;

  setSleepTimer: (minutes: number | null) => void;
}

const DEFAULT_AMBIENT_LAYERS: AmbientLayer[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', audioPath: '/ambient/rain.mp3', volume: 0.4, active: false },
  { id: 'cafe', name: 'Café', emoji: '☕', audioPath: '/ambient/cafe.mp3', volume: 0.3, active: false },
  { id: 'fire', name: 'Fireplace', emoji: '🔥', audioPath: '/ambient/fire.mp3', volume: 0.4, active: false },
  { id: 'waves', name: 'Waves', emoji: '🌊', audioPath: '/ambient/waves.mp3', volume: 0.35, active: false },
  { id: 'forest', name: 'Forest', emoji: '🌲', audioPath: '/ambient/forest.mp3', volume: 0.35, active: false },
  { id: 'white', name: 'White Noise', emoji: '〰️', audioPath: '/ambient/white-noise.mp3', volume: 0.2, active: false },
];

function buildShuffledIndices(length: number, currentIndex: number): number[] {
  const indices = Array.from({ length }, (_, i) => i).filter(i => i !== currentIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIndex, ...indices];
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,

  status: 'idle',
  volume: 0.8,
  muted: false,
  currentTime: 0,
  duration: 0,
  repeatMode: 'none',
  shuffled: false,
  shuffledIndices: [],

  isPlaylistOpen: false,
  isAmbientOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  dominantColors: {
    primary: 'rgba(139, 92, 246, 0.6)',
    secondary: 'rgba(219, 39, 119, 0.4)',
    tertiary: 'rgba(14, 165, 233, 0.3)',
  },
  ambientLayers: DEFAULT_AMBIENT_LAYERS,
  currentScene: 'snow',
  setScene: (scene) => set({ currentScene: scene }),

  favorites: loadFavorites(),
  toggleFavorite: (track) =>
    set((state) => {
      const exists = state.favorites.some((f) => f.id === track.id);
      const updated = exists
        ? state.favorites.filter((f) => f.id !== track.id)
        : [...state.favorites, track];
      saveFavorites(updated);
      return { favorites: updated };
    }),
  isFavorite: (trackId) => usePlayerStore.getState().favorites.some((f) => f.id === trackId),

  sleepTimerMinutes: null,
  sleepTimerEndsAt: null,

  playbackCommand: null,
  issuePlaybackCommand: (command) => set({ playbackCommand: command }),
  clearPlaybackCommand: () => set({ playbackCommand: null }),

  setCurrentTrack: (track) => set({ currentTrack: track, status: 'loading', currentTime: 0 }),

  setQueue: (tracks, startIndex = 0) => {
    const shuffledIndices = buildShuffledIndices(tracks.length, startIndex);
    const startTrack = tracks[startIndex];
    set({
      queue: tracks,
      queueIndex: startIndex,
      currentTrack: startTrack ?? null,
      status: startTrack ? 'loading' : 'idle',
      currentTime: 0,
      shuffledIndices,
    });
  },

  addToQueue: (track) =>
    set((state) => ({ queue: [...state.queue, track] })),

  removeFromQueue: (index) =>
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      const newIndex = index < state.queueIndex
        ? state.queueIndex - 1
        : Math.min(state.queueIndex, newQueue.length - 1);
      return { queue: newQueue, queueIndex: newIndex };
    }),

  playNext: () => {
    const { queue, queueIndex, shuffled, shuffledIndices, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (repeatMode === 'one') {
      nextIndex = queueIndex;
    } else if (shuffled) {
      const shufflePosition = shuffledIndices.indexOf(queueIndex);
      const nextShufflePosition = (shufflePosition + 1) % shuffledIndices.length;
      nextIndex = shuffledIndices[nextShufflePosition] ?? 0;
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }

    const nextTrack = queue[nextIndex];
    if (!nextTrack) return;
    set({ queueIndex: nextIndex, currentTrack: nextTrack, status: 'loading', currentTime: 0 });
  },

  playPrevious: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIndex];
    if (!prevTrack) return;
    set({ queueIndex: prevIndex, currentTrack: prevTrack, status: 'loading', currentTime: 0 });
  },

  playAtIndex: (index) => {
    const { queue } = get();
    if (!queue[index]) return;
    set({
      queueIndex: index,
      currentTrack: queue[index],
      status: 'loading',
      currentTime: 0,
    });
  },

  setStatus: (status) => set({ status }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  toggleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'none' ? 'all' : state.repeatMode === 'all' ? 'one' : 'none',
    })),

  toggleShuffle: () =>
    set((state) => {
      const shuffledIndices = buildShuffledIndices(state.queue.length, state.queueIndex);
      return { shuffled: !state.shuffled, shuffledIndices };
    }),

  togglePlaylist: () => set((state) => ({ isPlaylistOpen: !state.isPlaylistOpen })),
  toggleAmbient: () => set((state) => ({ isAmbientOpen: !state.isAmbientOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen, searchQuery: '' })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),

  setDominantColors: (dominantColors) => set({ dominantColors }),

  updateAmbientLayer: (id, changes) =>
    set((state) => ({
      ambientLayers: state.ambientLayers.map((layer) =>
        layer.id === id ? { ...layer, ...changes } : layer
      ),
    })),

  setSleepTimer: (minutes) =>
    set({
      sleepTimerMinutes: minutes,
      sleepTimerEndsAt: minutes ? Date.now() + minutes * 60 * 1000 : null,
    }),
}));
