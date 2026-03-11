import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YTPlayerOptions) => void;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerOptions {
  width: number;
  height: number;
  videoId?: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
    onError?: (event: { data: number }) => void;
  };
}

interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

let ytApiReadyPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (ytApiReadyPromise) return ytApiReadyPromise;

  ytApiReadyPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  });

  return ytApiReadyPromise;
}

export interface UseYouTubePlayerReturn {
  seek: (fraction: number) => void;
}

export function useYouTubePlayer(): UseYouTubePlayerReturn {
  // Set only inside onReady — guarantees all methods are available
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const containerIdRef = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);
  const pendingVideoIdRef = useRef<string | null>(null);
  const timePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live refs for values used inside YouTube callbacks
  const repeatModeRef = useRef(usePlayerStore.getState().repeatMode);
  const volumeRef = useRef(usePlayerStore.getState().volume);
  const mutedRef = useRef(usePlayerStore.getState().muted);

  const { setStatus, setCurrentTime, setDuration, playNext, clearPlaybackCommand } = usePlayerStore();

  useEffect(() =>
    usePlayerStore.subscribe((state) => {
      repeatModeRef.current = state.repeatMode;
      volumeRef.current = state.volume;
      mutedRef.current = state.muted;
    })
  , []);

  // ─── One-time player setup ───────────────────────────────────────────────
  useEffect(() => {
    const containerId = containerIdRef.current;
    let isDestroyed = false;

    const container = document.createElement('div');
    container.id = containerId;
    container.style.cssText =
      'position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;opacity:0;pointer-events:none;overflow:hidden';
    document.body.appendChild(container);

    loadYouTubeIframeAPI().then(() => {
      if (isDestroyed) return;

      new window.YT.Player(containerId, {
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: ({ target }) => {
            if (isDestroyed) return;
            playerRef.current = target;
            target.setVolume(Math.round((mutedRef.current ? 0 : volumeRef.current) * 100));

            const pending = pendingVideoIdRef.current;
            if (pending) {
              pendingVideoIdRef.current = null;
              // Use cueVideoById instead of loadVideoById — browsers block autoplay
              // on initial page load before any user interaction. cueVideoById prepares
              // the video without attempting autoplay, avoiding the infinite loading state.
              target.cueVideoById(pending);
              setStatus('paused');
            }
          },

          onStateChange: ({ data, target }) => {
            if (isDestroyed) return;
            const State = window.YT.PlayerState;

            // YouTube drives status — React never calls play/pause back into YouTube
            // in response to these events, so there is no feedback loop.
            if (data === State.PLAYING) {
              setStatus('playing');
              setDuration(target.getDuration());
            } else if (data === State.PAUSED) {
              setStatus('paused');
            } else if (data === State.BUFFERING) {
              setStatus('loading');
            } else if (data === State.ENDED) {
              if (repeatModeRef.current === 'one') {
                target.seekTo(0, true);
                target.playVideo();
              } else {
                playNext();
              }
            }
          },

          onError: () => {
            if (!isDestroyed) setStatus('error');
          },
        },
      });
    });

    return () => {
      isDestroyed = true;
      if (timePollingRef.current) clearInterval(timePollingRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      container.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Poll current time while playing ────────────────────────────────────
  const status = usePlayerStore((state) => state.status);

  useEffect(() => {
    if (timePollingRef.current) {
      clearInterval(timePollingRef.current);
      timePollingRef.current = null;
    }
    if (status === 'playing') {
      timePollingRef.current = setInterval(() => {
        const player = playerRef.current;
        if (player) setCurrentTime(player.getCurrentTime());
      }, 500);
    }
    return () => {
      if (timePollingRef.current) clearInterval(timePollingRef.current);
    };
  }, [status]);

  // ─── Load new video when track changes ──────────────────────────────────
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  useEffect(() => {
    if (!currentTrack) return;
    const player = playerRef.current;
    if (player) {
      player.loadVideoById(currentTrack.id);
    } else {
      pendingVideoIdRef.current = currentTrack.id;
    }
  }, [currentTrack?.id]);

  // ─── Consume user play/pause commands ───────────────────────────────────
  // This is the ONLY place that calls player.playVideo() / player.pauseVideo().
  // YouTube callbacks update `status` for display only and never trigger this path.
  const playbackCommand = usePlayerStore((state) => state.playbackCommand);

  useEffect(() => {
    if (!playbackCommand) return;
    const player = playerRef.current;
    if (player) {
      if (playbackCommand === 'play') player.playVideo();
      else player.pauseVideo();
    }
    clearPlaybackCommand();
  }, [playbackCommand]);

  // ─── Sync volume/mute ───────────────────────────────────────────────────
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);

  useEffect(() => {
    playerRef.current?.setVolume(Math.round((muted ? 0 : volume) * 100));
  }, [volume, muted]);

  // ─── Seek ────────────────────────────────────────────────────────────────
  const seek = useCallback((fraction: number) => {
    const player = playerRef.current;
    if (!player) return;
    const dur = player.getDuration();
    if (dur > 0) player.seekTo(fraction * dur, true);
  }, []);

  return { seek };
}
