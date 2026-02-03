import { useEffect, useRef, useState } from "react";

interface Size {
  width: number;
  height: number;
}

export function useContainerSize<T extends HTMLElement = HTMLDivElement>(): [
  React.RefObject<T | null>,
  Size,
] {
  const containerRef = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [containerRef, size];
}
