// Pure dark base layer. The atmosphere is now handled by LofiScene.
export function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20" style={{ background: '#0c0c0f' }} />
      {/* Subtle vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }}
      />
    </>
  );
}
