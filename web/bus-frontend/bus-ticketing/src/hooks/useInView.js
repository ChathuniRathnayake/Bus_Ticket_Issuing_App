// src/hooks/useInView.js
import { useEffect, useRef, useState } from "react";

/**
 * 👀 useInView — tells you when an element has scrolled into view.
 *
 * Usage:
 *   const [ref, isVisible] = useInView();
 *   <div ref={ref} className={isVisible ? "opacity-100" : "opacity-0"}>
 *
 * Once it becomes visible, it STAYS visible (we stop watching) —
 * so the animation only plays once, the first time you scroll to it.
 */
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(node); // stop watching once it's shown
      }
    }, options);

    observer.observe(node);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, isVisible];
}