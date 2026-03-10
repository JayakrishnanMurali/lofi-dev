import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

export function AnimatedBackground() {
  const dominantColors = usePlayerStore((state) => state.dominantColors);
  const status = usePlayerStore((state) => state.status);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const beatPhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const orbs = [
      { x: 0.2, y: 0.3, baseRadius: 0.38, speed: 0.0007, phase: 0,            colorIndex: 0 },
      { x: 0.8, y: 0.7, baseRadius: 0.32, speed: 0.0009, phase: Math.PI * 0.7, colorIndex: 1 },
      { x: 0.5, y: 0.1, baseRadius: 0.28, speed: 0.0006, phase: Math.PI * 1.3, colorIndex: 2 },
      { x: 0.1, y: 0.8, baseRadius: 0.22, speed: 0.001,  phase: Math.PI * 0.3, colorIndex: 1 },
      { x: 0.9, y: 0.2, baseRadius: 0.24, speed: 0.0008, phase: Math.PI * 1.7, colorIndex: 0 },
    ];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      time += 1;

      // Simulate a slow beat pulse when playing
      const isPlaying = status === 'playing';
      beatPhaseRef.current = (beatPhaseRef.current + (isPlaying ? 0.018 : 0.005)) % (Math.PI * 2);
      const beatPulse = isPlaying ? Math.sin(beatPhaseRef.current) * 0.06 : 0;

      ctx.clearRect(0, 0, width, height);

      const colors = [
        dominantColors.primary,
        dominantColors.secondary,
        dominantColors.tertiary,
      ];

      orbs.forEach((orb) => {
        const floatX = Math.sin(time * orb.speed + orb.phase) * 0.09;
        const floatY = Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.07;
        const currentRadius = (orb.baseRadius + beatPulse) * Math.min(width, height);
        const currentX = (orb.x + floatX) * width;
        const currentY = (orb.y + floatY) * height;

        const orbColor = colors[orb.colorIndex % colors.length] ?? colors[0]!;

        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, currentRadius
        );
        gradient.addColorStop(0, orbColor);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [dominantColors, status]);

  return (
    <>
      <div className="fixed inset-0 -z-20" style={{ background: '#0a0a14' }} />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ filter: 'blur(55px)', opacity: 0.9 }}
      />

      {/* Fine noise texture for depth */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)' }}
      />
    </>
  );
}
