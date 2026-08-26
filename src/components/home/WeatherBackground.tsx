import { useEffect, useRef, useState } from "react";
import { weatherThemeGroup } from "../../lib/weatherTheme";
import { weatherPhotoUrl } from "../../lib/weatherPhoto";

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: Math.round(window.innerWidth),
    height: Math.round(window.innerHeight),
  }));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onResize() {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSize({ width: Math.round(window.innerWidth), height: Math.round(window.innerHeight) });
      }, 300);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(debounceRef.current);
    };
  }, []);

  return size;
}

/**
 * A plain gray placeholder that fades to a real photo (via loremflickr.com,
 * tagged by weather condition + day/night) once it loads. Requesting the
 * photo at the actual viewport size (rather than a fixed size) is what keeps
 * it from looking stretched/cropped oddly on whatever screen this is on.
 */
export function WeatherBackground({
  condition,
  isNight,
}: {
  condition: string | undefined;
  isNight: boolean;
}) {
  const group = weatherThemeGroup(condition);
  const { width, height } = useViewportSize();
  const photoUrl = weatherPhotoUrl(group, isNight, width, height);

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  // Adjusting state during render (React's documented pattern) to reset the
  // "loaded" flag whenever the target photo changes, without an extra effect.
  const [trackedUrl, setTrackedUrl] = useState(photoUrl);
  if (photoUrl !== trackedUrl) {
    setTrackedUrl(photoUrl);
    setLoadedUrl(null);
  }
  const photoLoaded = loadedUrl === photoUrl;

  return (
    <div className="wxbg" aria-hidden>
      <img
        key={photoUrl}
        className="wxbg__photo"
        src={photoUrl}
        alt=""
        style={{ opacity: photoLoaded ? 0.7 : 0 }}
        onLoad={() => setLoadedUrl(photoUrl)}
      />
    </div>
  );
}
