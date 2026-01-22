import { models } from "../../../wailsjs/go/models";

type PlayerHeaderProps = {
  vinyl: models.Vinyl;
  currentTrack?: models.Track;
  currentIndex: number;
  totalTracks: number;
};

export function PlayerHeader({ vinyl, currentTrack, currentIndex, totalTracks }: PlayerHeaderProps) {
  return (
    <div className="text-center mt-3">
      <div className="font-semibold text-[#2c241f]">{vinyl.title}</div>
      <div className="text-sm text-[#2c241f]">{vinyl.artist}</div>
      <div className="text-xs text-gray-500 mt-1">
        Track {currentIndex + 1} of {totalTracks}
      </div>
    </div>
  );
}
