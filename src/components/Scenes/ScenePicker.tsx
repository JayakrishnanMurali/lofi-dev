import { useState, useRef, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { SceneType } from '../../shared/types';

const SCENES: { id: SceneType; label: string; emoji: string; description: string }[] = [
  { id: 'snow',   label: 'Winter',      emoji: '❄️', description: 'Peaceful snowfall' },
  { id: 'rain',   label: 'Rain',        emoji: '🌧️', description: 'Rainy night window' },
  { id: 'forest', label: 'Forest',      emoji: '🌿', description: 'Fireflies at dusk' },
  { id: 'night',  label: 'Night city',  emoji: '🌃', description: 'City lights & stars' },
];

export function ScenePicker() {
  const currentScene = usePlayerStore((state) => state.currentScene);
  const setScene = usePlayerStore((state) => state.setScene);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const activeScene = SCENES.find((s) => s.id === currentScene);

  return (
    <div ref={containerRef} className="fixed left-4 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom,0px) + 90px)' }}>
      {/* Scene menu — slides up when open */}
      {open && (
        <div
          className="mb-2 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,10,14,0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            width: '180px',
          }}
        >
          <p className="text-xs px-3 pt-3 pb-2" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Scene
          </p>
          {SCENES.map((scene) => {
            const isActive = currentScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => { setScene(scene.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150"
                style={{ background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span className="text-base leading-none">{scene.emoji}</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: isActive ? '#f5f5f7' : 'rgba(255,255,255,0.6)' }}>
                    {scene.label}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{scene.description}</p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.7)' }} />
                )}
              </button>
            );
          })}
          <div className="h-2" />
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
        style={{
          background: open ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,14,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.09)',
          color: 'rgba(255,255,255,0.65)',
        }}
        aria-label="Change scene"
        title="Change atmosphere"
      >
        <span className="text-sm leading-none">{activeScene?.emoji ?? '❄️'}</span>
        <span className="text-xs hidden sm:inline" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {activeScene?.label}
        </span>
        <Layers size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
      </button>
    </div>
  );
}
