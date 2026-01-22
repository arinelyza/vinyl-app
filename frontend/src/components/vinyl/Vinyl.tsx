import { useEffect, useRef } from "react";
import "./Vinyl.css";

export default function VinylPlayer({ isPlaying }: { isPlaying: boolean }) {
  const vinylRef = useRef<HTMLDivElement | null>(null);

  const rotationRef = useRef(0);
  const rpmRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const TARGET_RPM = isPlaying ? 33.3 : 0;

  useEffect(() => {
    let rafId: number;

    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      rpmRef.current += (TARGET_RPM - rpmRef.current) * 0.08;

      rotationRef.current += rpmRef.current * 6 * dt;

      if (vinylRef.current) {
        vinylRef.current.style.transform =
          `rotate(${rotationRef.current}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  return (
    <div id="album">
      <div id="vinyl" ref={vinylRef}>
        {/*<div id="print" />*/}
      </div>
    </div>
  );
}
