import { usePlayerStore } from '../../store/playerStore';
import type { SceneType } from '../../shared/types';

const SCENES: { id: SceneType; label: string; emoji: string }[] = [
  { id: 'rain',   label: 'Rainy night',  emoji: '🌧️' },
  { id: 'cafe',   label: 'Cozy café',    emoji: '☕' },
  { id: 'forest', label: 'Forest',       emoji: '🌿' },
  { id: 'night',  label: 'Night city',   emoji: '🌃' },
  { id: 'snow',   label: 'Winter',       emoji: '❄️' },
];

export function ScenePicker() {
  const currentScene = usePlayerStore((state) => state.currentScene);
  const setScene = usePlayerStore((state) => state.setScene);

  return (
    <div className="flex items-center gap-1">
      {SCENES.map((scene) => {
        const isActive = currentScene === scene.id;
        return (
          <button
            key={scene.id}
            onClick={() => setScene(scene.id)}
            title={scene.label}
            aria-label={scene.label}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
              filter: isActive ? 'none' : 'grayscale(0.3) opacity(0.55)',
            }}
          >
            {scene.emoji}
          </button>
        );
      })}
    </div>
  );
}
