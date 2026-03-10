import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

// Beautiful simulated visualizer — smoothly animated frequency-style bars
// driven by time + seeded noise (no Web Audio API needed with YouTube IFrame)
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const status = usePlayerStore((state) => state.status);
  const dominantColors = usePlayerStore((state) => state.dominantColors);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BAR_COUNT = 40;
    const smoothedHeights = new Float32Array(BAR_COUNT).fill(0.05);
    // Each bar gets a slightly different phase & frequency for organic look
    const barPhases = Array.from({ length: BAR_COUNT }, (_, i) => ({
      freq1: 0.4 + (i / BAR_COUNT) * 0.8,
      freq2: 0.15 + (i / BAR_COUNT) * 0.3,
      phase1: (i / BAR_COUNT) * Math.PI * 4,
      phase2: (i / BAR_COUNT) * Math.PI * 2.5,
      amp: 0.3 + Math.abs(Math.sin(i * 1.3)) * 0.5,
    }));

    let time = 0;

    function draw() {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const isPlaying = status === 'playing';
      const speed = isPlaying ? 0.022 : 0.004;

      time += speed;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / BAR_COUNT) * 0.65;
      const barSpacing = width / BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        const bp = barPhases[i]!;

        // Target height: layered sine waves create organic, musical-looking motion
        let targetHeight: number;
        if (isPlaying) {
          const wave1 = Math.sin(time * bp.freq1 + bp.phase1) * 0.5 + 0.5;
          const wave2 = Math.sin(time * bp.freq2 + bp.phase2) * 0.5 + 0.5;
          // Bell curve envelope so center bars are taller (more natural)
          const envelope = 0.4 + Math.exp(-Math.pow((i - BAR_COUNT / 2) / (BAR_COUNT / 3), 2)) * 0.6;
          targetHeight = (wave1 * 0.6 + wave2 * 0.4) * bp.amp * envelope;
          targetHeight = Math.max(0.04, targetHeight);
        } else {
          // Idle: very low gentle undulation
          targetHeight = 0.04 + Math.sin(time * 0.5 + i * 0.3) * 0.02;
        }

        // Smooth toward target
        smoothedHeights[i] = (smoothedHeights[i] ?? 0) * 0.82 + targetHeight * 0.18;

        const barHeight = smoothedHeights[i]! * height * 0.9;
        const x = i * barSpacing + (barSpacing - barWidth) / 2;
        const y = height - barHeight;
        const radius = Math.min(barWidth / 2, 4);

        // Per-bar gradient from accent colors
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, dominantColors.primary.replace(/[\d.]+\)$/, '0.95)'));
        gradient.addColorStop(0.55, dominantColors.secondary.replace(/[\d.]+\)$/, '0.7)'));
        gradient.addColorStop(1, dominantColors.tertiary.replace(/[\d.]+\)$/, '0.35)'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 1, 1]);
        ctx.fill();

        // Subtle reflection below
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.scale(1, -1);
        ctx.fillStyle = gradient;
        const reflectionHeight = barHeight * 0.25;
        ctx.beginPath();
        ctx.roundRect(x, -height - reflectionHeight, barWidth, reflectionHeight, [1, 1, radius, radius]);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, dominantColors]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={56}
      className="w-full"
      style={{ height: '56px' }}
    />
  );
}
