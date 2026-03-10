import { useEffect, useState } from "react";

declare global {
  // eslint-disable-next-line no-var
  var __lumiScriptLoaders: Map<string, Promise<void>> | undefined;
}

export function useScript(src: string | null): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const loaders = globalThis.__lumiScriptLoaders ?? (globalThis.__lumiScriptLoaders = new Map());

    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing?.getAttribute("data-loaded") === "true") {
      setLoaded(true);
      return;
    }

    const p = loaders.get(src) ?? new Promise<void>((resolve, reject) => {
      // Double-check after we create the promise (prevents race duplicates)
      const already = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (already) {
        if (already.getAttribute("data-loaded") === "true") resolve();
        else {
          already.addEventListener("load", () => resolve(), { once: true });
          already.addEventListener("error", () => reject(new Error("Script failed to load")), { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-lumi-script", "true");
      script.addEventListener("load", () => {
        script.setAttribute("data-loaded", "true");
        resolve();
      }, { once: true });
      script.addEventListener("error", () => reject(new Error("Script failed to load")), { once: true });
      document.head.appendChild(script);
    });

    loaders.set(src, p);
    p.then(() => setLoaded(true)).catch(() => setLoaded(false));

    // Do not remove scripts on unmount; multiple components may share it.
    return;
  }, [src]);

  return loaded;
}
