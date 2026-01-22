import { Button } from "../../components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import VinylPlayer from "../../components/vinyl/Vinyl";
import { models } from "../../../wailsjs/go/models";
import { useVinylTimeline } from "../../hooks/useVinylTimeline";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { PlayerHeader } from "../../components/player/PlayerHeader";
import { ProgressBar } from "../../components/player/ProgressBar";
import { PlayerControls } from "../../components/player/PlayerControls";
import { MarkVinylPlayed } from "../../../wailsjs/go/services/ImportService";

export function PlayerPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const vinyl = location.state as models.Vinyl | null;
  const { tracks, timeline, totalDuration } = useVinylTimeline(vinyl);

  useEffect(() => {
    if (!vinyl || tracks.length === 0) {
      console.error("Invalid vinyl data, redirecting to home");
      navigate("/");
    }
  }, [vinyl, tracks.length, navigate]);

  const hasTracks = vinyl && tracks.length > 0;
  if (!hasTracks) {
    return null;
  }

  const {
    audioRef,
    audioSrc,
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
  } = useAudioPlayer({ tracks, timeline, totalDuration });

  const markedPlayedRef = useRef(false);

  useEffect(() => {
    async function markPlayed() {
      if (!vinyl) return;
      try {
        await MarkVinylPlayed(vinyl.id);
      } catch (err) {
        console.error("Failed to mark vinyl as played", err);
      }
    }

    if (isPlaying && !markedPlayedRef.current) {
      markedPlayedRef.current = true;
      markPlayed();
    }
  }, [isPlaying, vinyl]);

  return (
    <div className="bg-[#f8f5ef] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <div className="absolute top-8 left-8">
        <Button
          onClick={() => navigate("/")}
          className="
            bg-transparent
            text-[#6b5e55]
            hover:text-[#2c241f]
            hover:bg-[#f3ece4]
            active:bg-[#eae2d9]
            border-none
            shadow-none
            rounded-md
            transition-colors
          "
        >
          ← Back
        </Button>
      </div>

      {/* Vinyl player */}
      <VinylPlayer isPlaying={isPlaying} />

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
      ></audio>

      <PlayerHeader
        vinyl={vinyl}
        currentTrack={currentTrack}
        currentIndex={currentTrackIndex}
        totalTracks={tracks.length}
      />

      <ProgressBar
        progress={progress}
        duration={totalDuration}
        onChange={handleSeekChange}
        onSeekStart={beginSeek}
        onSeekEnd={handleSeekEnd}
      />

      <PlayerControls
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
      />
    </div>
  );
}
