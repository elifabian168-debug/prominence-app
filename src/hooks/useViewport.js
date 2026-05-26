import { useEffect, useState } from "react";

// Single responsive breakpoint: 1024px is the natural "I'm sitting at a
// computer" threshold. Below it, the mobile UI (480px column + bottom-nav)
// stays in place. Above it, the desktop shell takes over.
const DESKTOP_QUERY = "(min-width: 1024px)";

export function useViewport() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(DESKTOP_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { isDesktop };
}
