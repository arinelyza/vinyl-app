import { ChangeEvent, useMemo } from "react";

type ProgressBarProps = {
  progress: number;
  duration: number;
  onChange: (value: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
};

export function ProgressBar({ progress, duration, onChange, onSeekStart, onSeekEnd }: ProgressBarProps) {
  const clampedProgress = useMemo(() => {
    if (!progress || Number.isNaN(progress)) return 0;
    return Math.min(Math.max(progress, 0), duration || 0);
  }, [progress, duration]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    onChange(Number.isNaN(value) ? 0 : value);
  };

  return (
    <div className="w-[80%] max-w-lg mt-12">
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={clampedProgress}
        onChange={handleChange}
        onMouseDown={onSeekStart}
        onMouseUp={onSeekEnd}
        onTouchStart={onSeekStart}
        onTouchEnd={onSeekEnd}
        className="w-full accent-[#2c241f]"
      />
      <div className="flex justify-between text-sm mt-1 text-[#2c241f] font-mono">
        <span>{formatTime(clampedProgress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(time: number) {
  if (!time || Number.isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
