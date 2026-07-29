import { useEffect, useState } from "react";


export const useTextLoop = (texts: string[], delay = 5000) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % texts.length);
    }, delay);

    return () => clearInterval(interval);
  }, [delay, texts.length]);
  return texts[idx];
};
