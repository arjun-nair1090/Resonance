"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HeartIcon, PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Song } from "@/lib/types";

export function TrackCard({
  song,
  onPlay,
  onLike,
  onQueue
}: {
  song: Song;
  onPlay: (song: Song) => void;
  onLike: (song: Song) => void;
  onQueue: (song: Song) => void;
}) {
  return (
    <motion.article
      layout
      whileHover={{ y: -5 }}
      className="group min-w-[190px] rounded-lg border border-white/10 bg-white/[0.065] p-3 transition hover:bg-white/[0.105]"
    >
      <button onClick={() => onPlay(song)} className="relative aspect-square w-full overflow-hidden rounded-md bg-graphite text-left">
        {song.artwork_url ? (
          <Image src={song.artwork_url} alt={song.track_name} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-pulse/35 to-coral/35 text-4xl font-black">{song.track_name.slice(0, 1)}</div>
        )}
        <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-pulse text-ink opacity-0 shadow-glow transition group-hover:opacity-100">
          <PlayIcon className="size-5" />
        </span>
      </button>
      <h3 className="mt-3 truncate text-sm font-black">{song.track_name}</h3>
      <p className="truncate text-xs text-white/58">{song.artist_name}</p>
      <p className="mt-1 truncate text-xs text-aqua">{song.genre || song.album_name || "iTunes Preview"}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onLike(song)} className="grid size-9 place-items-center rounded-md bg-white/8 text-white/70 hover:bg-coral/20 hover:text-coral">
          <HeartIcon className="size-4" />
        </button>
        <button onClick={() => onQueue(song)} className="grid size-9 place-items-center rounded-md bg-white/8 text-white/70 hover:bg-pulse/20 hover:text-pulse">
          <PlusIcon className="size-4" />
        </button>
      </div>
    </motion.article>
  );
}
