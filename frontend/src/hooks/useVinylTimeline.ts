import { useMemo } from "react";
import { models } from "../../wailsjs/go/models";

export type TrackTimelineEntry = {
  index: number;
  start: number;
  end: number;
  duration: number;
};

export function useVinylTimeline(vinyl: models.Vinyl | null) {
  const tracks = vinyl?.discs?.[0]?.tracks ?? [];

  const { timeline, totalDuration } = useMemo(() => {
    let cumulative = 0;
    const entries: TrackTimelineEntry[] = tracks.map((track, index) => {
      const duration = track.duration ?? 0;
      const start = cumulative;
      cumulative += duration;
      return {
        index,
        start,
        end: cumulative,
        duration,
      };
    });

    return {
      timeline: entries,
      totalDuration: cumulative,
    };
  }, [tracks]);

  return { tracks, timeline, totalDuration };
}
