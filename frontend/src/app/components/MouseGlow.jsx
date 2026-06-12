'use client';
import { useEffect, useState, useRef } from 'react';

export default function MouseGlow() {
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsIdle(false);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 1200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const size = isIdle ? '800px' : '500px';
  const opacity = isIdle ? 0.18 : 0.1;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-0 transition-all duration-700 ease-out"
      style={{
        width: size,
        height: size,
        transform: `translate(${position.x - parseInt(size) / 2}px, ${position.y - parseInt(size) / 2}px)`,
        background: `radial-gradient(circle, rgba(99,102,241,${opacity}) 0%, rgba(59,130,246,${opacity}) 40%, transparent 80%)`,
        filter: 'blur(50px)',
        borderRadius: '9999px',
      }}
    />
  );
}