import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function useKeyboard(seekFn: (fraction: number) => void) {
  const {
    status,
    volume,
    issuePlaybackCommand,
    setVolume,
    setMuted,
    muted,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    toggleSearch,
    currentTime,
    duration,
  } = usePlayerStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't intercept if user is typing in an input
      const activeTag = (event.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          issuePlaybackCommand(status === 'playing' ? 'pause' : 'play');
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) {
            playNext();
          } else if (duration > 0) {
            seekFn(Math.min(1, (currentTime + 10) / duration));
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) {
            playPrevious();
          } else if (duration > 0) {
            seekFn(Math.max(0, (currentTime - 10) / duration));
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;

        case 'ArrowDown':
          event.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;

        case 'KeyM':
          setMuted(!muted);
          break;

        case 'KeyN':
          playNext();
          break;

        case 'KeyP':
          playPrevious();
          break;

        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleShuffle();
          }
          break;

        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleRepeat();
          }
          break;

        case 'KeyK':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleSearch();
          }
          break;

        case 'Slash':
          if (event.key === '/') {
            event.preventDefault();
            toggleSearch();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, volume, muted, currentTime, duration, seekFn]);
}
