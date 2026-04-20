"use client";

import { Song } from "@/lib/types";
import { TrackCard } from "./TrackCard";

export function SectionRail({
  title,
  reason,
  tracks,
  onPlay,
  onLike,
  onQueue,
  onExplore
}: {
  title: string;
  reason: string;
  tracks: Song[];
  onPlay: (song: Song) => void;
  onLike: (song: Song) => void;
  onQueue: (song: Song) => void;
  onExplore?: () => void;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{reason}</p>
        </div>
        {onExplore && (
          <button onClick={onExplore} className="rounded-md border border-white/12 px-4 py-2 text-sm font-bold text-white/64 transition hover:border-pulse hover:text-pulse">
            Explore more
          </button>
        )}
      </div>
      <div className="scrollbar-hidden flex gap-4 overflow-x-auto pb-2">
        {tracks.map((track) => (
          <TrackCard key={`${title}-${track.itunes_track_id}`} song={track} onPlay={onPlay} onLike={onLike} onQueue={onQueue} />
        ))}
      </div>
    </section>
  );
}
