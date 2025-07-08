import { useRef } from 'react';

const MouseParallaxCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 23; // sensibilidad
    const moveY = (y - centerY) / 10;

    el.style.transform = `rotateY(${moveX}deg) rotateX(${moveY * -1}deg)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-300 ease-out will-change-transform"
    >
      {children}
    </div>
  );
};

export default MouseParallaxCard;