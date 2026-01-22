import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { Button } from "../ui/button";

type PlayerControlsProps = {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
};

export function PlayerControls({ isPlaying, onPlay, onPause }: PlayerControlsProps) {
  const [isSequencing, setIsSequencing] = useState(false);
  const hasPlayedNeedleDropRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const [playStartButton, { stop: stopStartButton, sound: startButtonSound }] = useSound("/sounds/startbutton.mp3");
  const [playNeedleDrop, { stop: stopNeedleDrop, sound: needleDropSound }] = useSound("/sounds/needledrop.wav");

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutsRef.current = [];
  };

  const getDurationMs = (sound: { duration?: () => number } | null | undefined, fallbackMs: number) => {
    const durationSeconds = sound?.duration?.() ?? 0;
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
      return durationSeconds * 1000;
    }
    return fallbackMs;
  };

  function onPlayClick() {
    if (isPlaying || isSequencing) return;
    setIsSequencing(true);

    if (!hasPlayedNeedleDropRef.current) {
      playStartButton();
      const startButtonDelay = getDurationMs(startButtonSound, 250);

      const startTimeout = window.setTimeout(() => {
        playNeedleDrop();
        hasPlayedNeedleDropRef.current = true;
        const needleDropDelay = getDurationMs(needleDropSound, 900);

        const playTimeout = window.setTimeout(() => {
          onPlay();
          setIsSequencing(false);
        }, needleDropDelay);

        timeoutsRef.current.push(playTimeout);
      }, startButtonDelay);

      timeoutsRef.current.push(startTimeout);
      return;
    }

    playStartButton();
    onPlay();
    setIsSequencing(false);
  }

  function onPauseClick() {
    clearPendingTimeouts();
    stopStartButton();
    stopNeedleDrop();
    setIsSequencing(false);
    playStartButton();
    onPause();
  }

  useEffect(() => {
    return () => {
      clearPendingTimeouts();
      stopStartButton();
      stopNeedleDrop();
    };
  }, [stopNeedleDrop, stopStartButton]);

  return (
    <div className="mt-4 flex gap-4">
      <Button
        className="bg-[#2c241f] hover:bg-[#3a302a] text-[#f8f5ef]"
        onClick={onPlayClick}
        disabled={isPlaying || isSequencing}
      >
        Start
      </Button>
      <Button
        className="bg-[#f3ece4] hover:bg-[#eae2d9] text-[#2c241f]"
        onClick={onPauseClick}
        disabled={!isPlaying && !isSequencing}
      >
        Pause
      </Button>
    </div>
  );
}
