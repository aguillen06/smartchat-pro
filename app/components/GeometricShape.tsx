'use client';

import { useEffect, useRef } from 'react';

export default function GeometricShape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
      mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const phi = (1 + Math.sqrt(5)) / 2;
    
    const createIcosahedron = (scale: number) => {
      return [
        { x: 0, y: 1, z: phi }, { x: 0, y: -1, z: phi },
        { x: 0, y: 1, z: -phi }, { x: 0, y: -1, z: -phi },
        { x: 1, y: phi, z: 0 }, { x: -1, y: phi, z: 0 },
        { x: 1, y: -phi, z: 0 }, { x: -1, y: -phi, z: 0 },
        { x: phi, y: 0, z: 1 }, { x: -phi, y: 0, z: 1 },
        { x: phi, y: 0, z: -1 }, { x: -phi, y: 0, z: -1 },
      ].map(p => ({ x: p.x * scale, y: p.y * scale, z: p.z * scale }));
    };

    const edges = [
      [0, 1], [0, 4], [0, 5], [0, 8], [0, 9],
      [1, 6], [1, 7], [1, 8], [1, 9],
      [2, 3], [2, 4], [2, 5], [2, 10], [2, 11],
      [3, 6], [3, 7], [3, 10], [3, 11],
      [4, 5], [4, 8], [4, 10],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 9], [7, 11],
      [8, 10], [9, 11]
    ];

    const rotateX = (point: any, angle: number) => ({
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
    });

    const rotateY = (point: any, angle: number) => ({
      x: point.x * Math.cos(angle) + point.z * Math.sin(angle),
      y: point.y,
      z: -point.x * Math.sin(angle) + point.z * Math.cos(angle)
    });

    const project = (point: any, width: number, height: number, offsetX: number) => {
      const fov = 400;
      const z = point.z + 6;
      const scale = fov / z;
      return {
        x: point.x * scale + width / 2 + offsetX,
        y: point.y * scale + height / 2
      };
    };

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);
      time += 0.005;
      
      const morphFactor = Math.sin(time * 0.4) * 0.2 + 1;
      const baseScale = Math.min(width, height) * 0.22;
      
      let vertices = createIcosahedron(baseScale * morphFactor);
      
      const rotX = time * 0.2 + mouseY * 0.3;
      const rotY = time * 0.25 + mouseX * 0.3;
      
      vertices = vertices.map(v => {
        let p = rotateX(v, rotX);
        p = rotateY(p, rotY);
        p.y += Math.sin(time * 1.5 + p.x * 0.03) * 3;
        return p;
      });

      // Offset to the right side
      const offsetX = width * 0.2;
      const projected = vertices.map(v => project(v, width, height, offsetX));

      // Draw edges with thin lines
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (vertices[i].z + vertices[j].z) / 2;
        const opacity = Math.max(0.08, Math.min(0.4, (avgZ + baseScale * 2) / (baseScale * 5)));
        
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, `rgba(16, 185, 129, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(20, 184, 166, ${opacity * 1.1})`);
        gradient.addColorStop(1, `rgba(16, 185, 129, ${opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw vertices as small glowing points
      projected.forEach((p, i) => {
        const z = vertices[i].z;
        const opacity = Math.max(0.15, Math.min(0.6, (z + baseScale * 2) / (baseScale * 3)));
        const size = 1.5 + opacity * 2;
        
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        glow.addColorStop(0, `rgba(16, 185, 129, ${opacity * 0.4})`);
        glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.fill();
      });

      // Subtle floating particles
      for (let i = 0; i < 12; i++) {
        const angle = (time * 0.3 + i * 0.5) % (Math.PI * 2);
        const radius = baseScale * 1.8 + Math.sin(time + i) * 15;
        const px = width / 2 + offsetX + Math.cos(angle) * radius;
        const py = height / 2 + Math.sin(angle) * radius * 0.5;
        
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.2 + Math.sin(time + i) * 0.1})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
