import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { AmbientLayer } from '../../shared/types';

function AmbientLayerTile({ layer }: { layer: AmbientLayer }) {
  const updateAmbientLayer = usePlayerStore((state) => state.updateAmbientLayer);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(layer.audioPath);
    audio.loop = true;
    audio.volume = layer.volume;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = layer.volume;
    if (layer.active) audio.play().catch(() => {});
    else audio.pause();
  }, [layer.active, layer.volume]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => updateAmbientLayer(layer.id, { active: !layer.active })}
        className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
        style={{
          background: layer.active ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${layer.active ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: layer.active ? '0 0 16px rgba(167,139,250,0.2) inset' : 'none',
        }}
      >
        {/* Active glow ring */}
        {layer.active && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.25) 0%, transparent 70%)',
            }}
          />
        )}
        <span className="text-xl relative z-10">{layer.emoji}</span>
        <span
          className="text-xs font-medium relative z-10"
          style={{ color: layer.active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)' }}
        >
          {layer.name}
        </span>
      </button>

      {/* Volume slider — always visible, dimmed when inactive */}
      <div className="px-1" style={{ opacity: layer.active ? 1 : 0.25, transition: 'opacity 0.2s' }}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={layer.volume}
          disabled={!layer.active}
          onChange={(e) => updateAmbientLayer(layer.id, { volume: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: '#a78bfa', cursor: layer.active ? 'pointer' : 'default' }}
          aria-label={`${layer.name} volume`}
        />
      </div>
    </div>
  );
}

export function AmbientMixer() {
  const isAmbientOpen = usePlayerStore((state) => state.isAmbientOpen);
  const ambientLayers = usePlayerStore((state) => state.ambientLayers);
  const toggleAmbient = usePlayerStore((state) => state.toggleAmbient);

  if (!isAmbientOpen) return null;

  return (
    <div
      className="fixed z-50 rounded-2xl p-4"
      style={{
        bottom: '128px',
        right: '16px',
        width: '280px',
        background: 'rgba(8, 8, 18, 0.96)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Ambient Mixer
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Layer sounds over your music
          </p>
        </div>
        <button
          onClick={toggleAmbient}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
          aria-label="Close ambient mixer"
        >
          <X size={14} />
        </button>
      </div>

      {/* 3-column grid of tiles */}
      <div className="grid grid-cols-3 gap-2">
        {ambientLayers.map((layer) => (
          <AmbientLayerTile key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
