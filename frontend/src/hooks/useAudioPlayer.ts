import { MutableRefObject, useEffect, useRef, useState } from "react";
import { GetAudioFileURL } from "../../wailsjs/go/main/App";
import { models } from "../../wailsjs/go/models";
import { TrackTimelineEntry } from "./useVinylTimeline";

type UseAudioPlayerArgs = {
  tracks: models.Track[];
  timeline: TrackTimelineEntry[];
  totalDuration: number;
};

type AudioPlayerReturn = {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  audioSrc: string;
  handleLoadedMetadata: () => void;
  progress: number;
  currentTrackIndex: number;
  currentTrack: models.Track | undefined;
  isPlaying: boolean;
  handlePlay: () => void;
  handlePause: () => void;
  beginSeek: () => void;
  handleSeekChange: (value: number) => void;
  handleSeekEnd: () => void;
  totalDuration: number;
};

export function useAudioPlayer({ tracks, timeline, totalDuration }: UseAudioPlayerArgs): AudioPlayerReturn {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [trackSources, setTrackSources] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const totalTracks = tracks.length;

  const currentSource = trackSources[currentTrackIndex] ?? "";
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    let cancelled = false;

    const preloadTracks = async () => {
      try {
        const urls = await Promise.all(
          tracks.map((track) => GetAudioFileURL(track.file_path))
        );
        if (!cancelled) {
          setTrackSources(urls);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to preload audio files:", err);
        }
      }
    };

    if (tracks.length > 0) {
      preloadTracks();
    }

    return () => {
      cancelled = true;
    };
  }, [tracks]);

  useEffect(() => {
    if (pendingSeekRef.current !== null) return;
    const trackStart = timeline[currentTrackIndex]?.start ?? 0;
    setProgress(trackStart);
  }, [currentTrackIndex, timeline]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSource || !isPlaying) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch((err) => {
        console.error("Playback failed:", err);
      });
    }
  }, [currentSource, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (isSeeking) return;
      const trackStart = timeline[currentTrackIndex]?.start ?? 0;
      setProgress(trackStart + audio.currentTime);
    };

    const handleTrackEnded = () => {
      setCurrentTrackIndex((prev) => {
        if (prev < totalTracks - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        setProgress(totalDuration);
        return prev;
      });
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleTrackEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleTrackEnded);
    };
  }, [isSeeking, timeline, currentTrackIndex, totalTracks, totalDuration]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pendingSeekRef.current !== null) {
      audio.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    }
  };

  const handleSeekEnd = () => {
    const audio = audioRef.current;
    if (!audio || timeline.length === 0) {
      setIsSeeking(false);
      return;
    }

    const targetTime = progress;
    const matchedEntry =
      timeline.find(
        (entry) => targetTime >= entry.start && targetTime < entry.end
      ) || timeline[timeline.length - 1];

    if (!matchedEntry) {
      setIsSeeking(false);
      return;
    }

    const relativeTime = Math.min(
      Math.max(targetTime - matchedEntry.start, 0),
      matchedEntry.duration
    );

    pendingSeekRef.current = relativeTime;

    if (matchedEntry.index !== currentTrackIndex) {
      setCurrentTrackIndex(matchedEntry.index);
    } else {
      audio.currentTime = relativeTime;
      pendingSeekRef.current = null;
    }

    setIsSeeking(false);
  };

  const handleSeekChange = (value: number) => {
    if (Number.isNaN(value)) {
      setProgress(0);
      return;
    }
    const clamped = Math.min(Math.max(value, 0), totalDuration || 0);
    setProgress(clamped);
  };

  const beginSeek = () => setIsSeeking(true);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return {
    audioRef,
    audioSrc: currentSource,
    handleLoadedMetadata,
    progress,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    handlePlay,
    handlePause,
    beginSeek,
    handleSeekChange,
    handleSeekEnd,
    totalDuration,
  };
}
