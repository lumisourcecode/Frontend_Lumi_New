import { useEffect, useState } from "react";

export function useScript(src: string | null): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [src]);

  return loaded;
}
