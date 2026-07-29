import React, { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle definition for nebula dust/stars
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      opacity: number;
      maxOpacity: number;
      fadeSpeed: number;
    }> = [];

    const colors = [
      'rgba(99, 102, 241, 0.15)',  // Indigo
      'rgba(168, 85, 247, 0.15)',  // Purple
      'rgba(236, 72, 153, 0.1)',   // Pink
      'rgba(59, 130, 246, 0.12)',  // Blue
    ];

    // Create a series of slowly moving large glow particles
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5 + 0.1,
        maxOpacity: Math.random() * 0.4 + 0.3,
        fadeSpeed: 0.002 + Math.random() * 0.003,
      });
    }

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const draw = () => {
      ctx.fillStyle = '#030008'; // Very deep dark space color
      ctx.fillRect(0, 0, width, height);

      // Draw dust clouds
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Pulse opacity
        p.opacity += p.fadeSpeed;
        if (p.opacity > p.maxOpacity || p.opacity < 0.1) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color.replace('0.1', `${p.opacity}`).replace('0.15', `${p.opacity}`));
        gradient.addColorStop(1, 'rgba(3, 0, 8, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw faint stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(Date.now() * 0.0005 + i * 100) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${sx * 0.3 + 0.1})`;
        ctx.fillRect(
          (Math.sin(i * 37) * 0.5 + 0.5) * width,
          (Math.cos(i * 43) * 0.5 + 0.5) * height,
          sx * 1.5 + 0.5,
          sx * 1.5 + 0.5
        );
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="shader-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-black opacity-60 pointer-events-none"
    />
  );
}
