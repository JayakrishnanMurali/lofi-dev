import { useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import type { SceneType } from '../../shared/types';

// Deterministic pseudo-random from seed (no re-render randomness)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function RainScene() {
  const drops = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      delay: rand() * 4,
      duration: 0.6 + rand() * 0.8,
      height: 12 + rand() * 22,
      opacity: 0.15 + rand() * 0.35,
      width: rand() > 0.85 ? 1.5 : 1,
    }));
  }, []);

  const splashes = useMemo(() => {
    const rand = seededRandom(7);
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: 40 + rand() * 55,
      delay: rand() * 3,
      duration: 1.2 + rand() * 0.8,
      size: 3 + rand() * 6,
    }));
  }, []);

  return (
    <div className="scene-layer">
      {/* Cool blue-grey tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20, 30, 60, 0.35)' }} />

      {/* Rain drops */}
      {drops.map((d) => (
        <div
          key={d.id}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            width: `${d.width}px`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}

      {/* Splash rings at the bottom */}
      {splashes.map((s) => (
        <div
          key={s.id}
          className="rain-splash"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size / 3}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* Window fog/condensation at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: 'linear-gradient(to top, rgba(20,30,60,0.25), transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function CafeScene() {
  const wisps = useMemo(() => {
    const rand = seededRandom(13);
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 15 + rand() * 70,
      delay: rand() * 6,
      duration: 4 + rand() * 4,
      width: 20 + rand() * 30,
      drift: (rand() - 0.5) * 40,
    }));
  }, []);

  const bokeh = useMemo(() => {
    const rand = seededRandom(99);
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 4 + rand() * 20,
      opacity: 0.04 + rand() * 0.1,
      delay: rand() * 8,
      duration: 6 + rand() * 8,
    }));
  }, []);

  return (
    <div className="scene-layer">
      {/* Warm amber tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(60, 35, 10, 0.3)' }} />

      {/* Bokeh lights */}
      {bokeh.map((b) => (
        <div
          key={b.id}
          className="cafe-bokeh"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            opacity: b.opacity,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}

      {/* Steam wisps */}
      {wisps.map((w) => (
        <div
          key={w.id}
          className="cafe-steam"
          style={{
            left: `${w.left}%`,
            width: `${w.width}px`,
            animationDelay: `${w.delay}s`,
            animationDuration: `${w.duration}s`,
            '--drift': `${w.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Warm glow from bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(90,50,10,0.2), transparent)',
      }} />
    </div>
  );
}

function ForestScene() {
  const fireflies = useMemo(() => {
    const rand = seededRandom(55);
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: 10 + rand() * 80,
      delay: rand() * 8,
      duration: 3 + rand() * 5,
      driftX: (rand() - 0.5) * 60,
      driftY: (rand() - 0.5) * 40,
      size: 2 + rand() * 3,
    }));
  }, []);

  return (
    <div className="scene-layer">
      {/* Deep forest green tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 30, 15, 0.35)' }} />

      {fireflies.map((f) => (
        <div
          key={f.id}
          className="firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            '--drift-x': `${f.driftX}px`,
            '--drift-y': `${f.driftY}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Dark tree silhouettes at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        background: 'linear-gradient(to top, rgba(2,12,5,0.7), transparent)',
      }} />
    </div>
  );
}

function NightCityScene() {
  const stars = useMemo(() => {
    const rand = seededRandom(77);
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 65,
      size: rand() > 0.9 ? 2 : 1,
      delay: rand() * 6,
      duration: 2 + rand() * 4,
      opacity: 0.3 + rand() * 0.7,
    }));
  }, []);

  const cityLights = useMemo(() => {
    const rand = seededRandom(33);
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: 55 + rand() * 35,
      size: 1 + rand() * 3,
      delay: rand() * 4,
      duration: 1.5 + rand() * 3,
      opacity: 0.4 + rand() * 0.5,
      color: rand() > 0.6 ? 'rgba(255,220,120,' : rand() > 0.3 ? 'rgba(120,180,255,' : 'rgba(255,120,100,',
    }));
  }, []);

  return (
    <div className="scene-layer">
      {/* Deep navy tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 8, 30, 0.4)' }} />

      {/* Stars */}
      {stars.map((s) => (
        <div
          key={`s-${s.id}`}
          className="city-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* City lights */}
      {cityLights.map((l) => (
        <div
          key={`l-${l.id}`}
          className="city-light"
          style={{
            left: `${l.left}%`,
            top: `${l.top}%`,
            width: `${l.size}px`,
            height: `${l.size}px`,
            opacity: l.opacity,
            background: `${l.color}1)`,
            boxShadow: `0 0 ${l.size * 2}px ${l.color}0.6)`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
          }}
        />
      ))}

      {/* Horizon glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to top, rgba(30,20,60,0.4), transparent)',
      }} />
    </div>
  );
}

function SnowScene() {
  const flakes = useMemo(() => {
    const rand = seededRandom(21);
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: rand() * 110 - 5,
      delay: rand() * 8,
      duration: 5 + rand() * 8,
      size: 1 + rand() * 4,
      drift: (rand() - 0.5) * 80,
      opacity: 0.4 + rand() * 0.5,
    }));
  }, []);

  return (
    <div className="scene-layer">
      {/* Cool ice-blue tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 25, 50, 0.3)' }} />

      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            '--snow-drift': `${f.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Snow accumulation at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
        background: 'linear-gradient(to top, rgba(200,220,255,0.06), transparent)',
      }} />
    </div>
  );
}

const SCENE_COMPONENTS: Record<SceneType, React.ComponentType> = {
  rain: RainScene,
  cafe: CafeScene,
  forest: ForestScene,
  night: NightCityScene,
  snow: SnowScene,
};

export function LofiScene() {
  const currentScene = usePlayerStore((state) => state.currentScene);
  const SceneComponent = SCENE_COMPONENTS[currentScene];
  return <SceneComponent />;
}
