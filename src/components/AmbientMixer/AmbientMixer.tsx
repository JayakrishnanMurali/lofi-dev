import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { AmbientLayer } from '../../shared/types';

function AmbientLayerRow({ layer }: { layer: AmbientLayer }) {
  const updateAmbientLayer = usePlayerStore((state) => state.updateAmbientLayer);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(layer.audioPath);
      audio.loop = true;
      audio.volume = layer.volume;
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = layer.volume;

    if (layer.active) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [layer.active, layer.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={() => updateAmbientLayer(layer.id, { active: !layer.active })}
        className="flex items-center gap-2 flex-1 text-left transition-all duration-150"
      >
        <span
          className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-all duration-150"
          style={{
            background: layer.active ? 'var(--accent-primary, rgba(139,92,246,0.25))' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${layer.active ? 'var(--accent-primary, rgba(139,92,246,0.4))' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {layer.emoji}
        </span>
        <span
          className="text-sm"
          style={{ color: layer.active ? 'rgba(240,234,248,0.9)' : 'rgba(240,234,248,0.5)' }}
        >
          {layer.name}
        </span>
      </button>

      {layer.active && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={layer.volume}
          onChange={(e) => updateAmbientLayer(layer.id, { volume: parseFloat(e.target.value) })}
          className="w-20 accent-current"
          style={{ accentColor: 'var(--accent-primary, #8b5cf6)' }}
          aria-label={`${layer.name} volume`}
        />
      )}
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
      className="fixed bottom-[144px] right-4 z-50 w-64 rounded-2xl p-4"
      style={{
        background: 'rgba(12, 12, 22, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'rgba(240,234,248,0.9)' }}>
          Ambient Sounds
        </h3>
        <button
          onClick={toggleAmbient}
          className="transition-colors duration-150"
          style={{ color: 'rgba(240,234,248,0.4)' }}
          aria-label="Close ambient mixer"
        >
          <X size={16} />
        </button>
      </div>

      <div
        className="text-xs mb-3 px-2 py-1.5 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(240,234,248,0.4)' }}
      >
        Layer ambient sounds with your music
      </div>

      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {ambientLayers.map((layer) => (
          <AmbientLayerRow key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
