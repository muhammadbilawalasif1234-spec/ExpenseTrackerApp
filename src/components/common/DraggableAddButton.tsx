import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

interface DraggableAddButtonProps {
  onClick: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export const DraggableAddButton: React.FC<DraggableAddButtonProps> = ({
  onClick,
  size = 60,
  backgroundColor = "#5D7D95",
  iconColor = "#FFFFFF",
}) => {
  const getBounds = () => {
    if (typeof window === "undefined") {
      return { minX: 16, maxX: 340, minY: 348, maxY: 680 };
    }
    const frame = document.getElementById("mobile-phone-frame");
    if (frame) {
      const rect = frame.getBoundingClientRect();
      const minX = rect.left + 16;
      const maxX = Math.max(minX, rect.right - size - 16);
      const minY = rect.top + 348; // Below the stats frame
      const maxY = Math.max(minY + 40, rect.bottom - 70 - size - 6); // 6px above bottom nav bar
      return { minX, maxX, minY, maxY };
    }
    const minX = 16;
    const maxX = Math.max(minX, window.innerWidth - size - 16);
    const minY = 348;
    const maxY = Math.max(minY + 40, window.innerHeight - 80 - size - 6);
    return { minX, maxX, minY, maxY };
  };

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const { maxX, maxY } = getBounds();
    return { x: maxX, y: Math.max(348, maxY - 16) };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const movedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const { minX, maxX, minY, maxY } = getBounds();
      setPos((prev) => ({
        x: Math.min(Math.max(prev.x, minX), maxX),
        y: Math.min(Math.max(prev.y, minY), maxY),
      }));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    movedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      movedRef.current = true;
    }
    const { minX, maxX, minY, maxY } = getBounds();
    const newX = Math.min(Math.max(dragStartRef.current.posX + dx, minX), maxX);
    const newY = Math.min(Math.max(dragStartRef.current.posY + dy, minY), maxY);
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (!movedRef.current) {
      onClick();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 40,
        touchAction: "none",
      }}
      className="select-none"
    >
      <button
        id="btn-draggable-action-plus"
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${size / 2}px`,
          backgroundColor,
          color: iconColor,
          boxShadow: isDragging
            ? "0 14px 30px rgba(93, 125, 149, 0.55)"
            : "0 8px 24px rgba(93, 125, 149, 0.35)",
          transform: isDragging ? "scale(1.08)" : "scale(1)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="flex items-center justify-center border-none transition-transform duration-100 ease-out active:scale-95"
        title="Add Income (Moveable)"
        aria-label="Add Income"
      >
        <Plus size={28} strokeWidth={2.8} />
      </button>
    </div>
  );
};

export default DraggableAddButton;
