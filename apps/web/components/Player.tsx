"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  HeartIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline, ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { Song } from "@/lib/types";

type RepeatMode = "off" | "all" | "one";

export function Player({
  current,
  queue,
  onEnded,
  onPrevious,
  onNext,
  onShuffleQueue,
  onLike,
  liked = false
}: {
  current?: Song;
  queue: Song[];
  onEnded: (repeatMode: RepeatMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffleQueue: () => void;
  onLike?: (song: Song) => void;
  liked?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [dragging, setDragging] = useState(false);

  // Sync volume/mute to element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  // Auto-play when track changes
  useEffect(() => {
    if (!audioRef.current) return;
    setProgress(0);
    setDuration(0);
    setBuffering(false);
    if (current?.preview_url) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.preview_url]);

  // Space bar shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "BUTTON", "SELECT"].includes(tag)) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const timeLeft = useMemo(() => Math.max(duration - progress, 0), [duration, progress]);

  function toggle() {
    if (!audioRef.current || !current?.preview_url) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }

  function seekFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !seekBarRef.current || duration === 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  }

  function seekVolume(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
    setMuted(pct === 0);
  }

  function toggleRepeat() {
    setRepeatMode(m => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }

  const effectiveVolume = muted ? 0 : volume;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[#0b0b0e]/95 backdrop-blur-3xl">
      {/* Top progress stripe */}
      <div className="relative h-[2px] w-full overflow-hidden bg-white/[0.06]">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#ff6b57] via-[#ff9c7d] to-[#65e0d2]"
          style={{ width: `${progressPct}%`, transition: dragging ? "none" : undefined }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">

        {/* ── LEFT: Artwork + info + like ── */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Artwork */}
          <div
            className="relative size-[52px] shrink-0 overflow-hidden rounded-xl bg-white/10 transition-shadow duration-700"
            style={playing ? { boxShadow: "0 0 20px rgba(255,107,87,0.35)" } : {}}
          >
            {current?.artwork_url ? (
              <Image
                src={current.artwork_url}
                alt={current.track_name}
                fill
                sizes="52px"
                className="object-cover"
                style={{ transform: playing ? "scale(1.05)" : "scale(1)", transition: "transform 0.7s" }}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <svg className="size-5 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                </svg>
              </div>
            )}
            {/* EQ overlay on hover when playing */}
            {playing && (
              <div className="absolute inset-0 flex items-end justify-center gap-[2px] bg-gradient-to-t from-black/70 pb-1.5 px-2 opacity-0 transition-opacity hover:opacity-100">
                <EqBars />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black leading-tight text-white">
              {current?.track_name || "No track selected"}
            </p>
            <p className="truncate text-[11px] leading-tight text-white/45 mt-0.5">
              {current?.artist_name || "Pick a song to start playing"}
            </p>
            {current ? (
              <p className="mt-1 text-[10px] uppercase tracking-widest font-bold text-[#ff6b57]/70">
                {current.genre || "Music"}{queue.length > 0 ? ` · ${queue.length} in queue` : ""}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-white/25">Space to play · Click any track</p>
            )}
          </div>

          {/* Like button */}
          {current && onLike && (
            <button
              onClick={() => onLike(current)}
              className={`shrink-0 rounded-full p-2 transition-all hover:scale-110 active:scale-95 ${liked ? "text-[#ff6b57]" : "text-white/30 hover:text-white/70"}`}
              title={liked ? "Liked" : "Like this track"}
            >
              {liked ? <HeartIcon className="size-4.5" /> : <HeartOutline className="size-4.5" />}
            </button>
          )}
        </div>

        {/* ── CENTER: Controls + seek ── */}
        <div className="flex w-full max-w-lg flex-col items-center gap-2">
          {/* Transport buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onShuffleQueue}
              disabled={queue.length < 2}
              className="rounded-full p-2 text-white/35 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              title="Shuffle queue"
            >
              <ArrowsRightLeftIcon className="size-4" />
            </button>

            <button
              onClick={onPrevious}
              className="rounded-full p-2 text-white/55 transition hover:bg-white/8 hover:text-white"
              title="Previous"
            >
              <BackwardIcon className="size-5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={toggle}
              disabled={!current?.preview_url}
              className="relative mx-1 grid size-11 place-items-center rounded-full bg-[#ff6b57] text-white transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={playing ? { boxShadow: "0 0 22px rgba(255,107,87,0.5)" } : {}}
              title="Play or pause (Space)"
            >
              {buffering ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : playing ? (
                <PauseIcon className="size-5" />
              ) : (
                <PlayIcon className="size-5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="rounded-full p-2 text-white/55 transition hover:bg-white/8 hover:text-white"
              title="Next"
            >
              <ForwardIcon className="size-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`relative rounded-full p-2 transition hover:bg-white/8 ${repeatMode !== "off" ? "text-[#ff6b57]" : "text-white/35"}`}
              title={`Repeat: ${repeatMode}`}
            >
              <ArrowPathRoundedSquareIcon className="size-4" />
              {repeatMode === "one" && (
                <span className="absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#ff6b57] text-[8px] font-black text-white">1</span>
              )}
            </button>
          </div>

          {/* Seek bar */}
          <div className="flex w-full items-center gap-2 text-[10px] tabular-nums text-white/30">
            <span className="w-6 text-right">{formatTime(progress)}</span>
            <div
              ref={seekBarRef}
              onClick={seekFromEvent}
              onMouseDown={() => setDragging(true)}
              onMouseUp={() => setDragging(false)}
              className={`group relative h-1 flex-1 cursor-pointer rounded-full bg-white/12 ${!current?.preview_url ? "pointer-events-none opacity-30" : ""}`}
            >
              {/* Fill */}
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#ff6b57] to-[#ff9c7d]"
                style={{ width: `${progressPct}%` }}
              />
              {/* Scrubber thumb */}
              <div
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${progressPct}%` }}
              />
            </div>
            <span className="w-6">-{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* ── RIGHT: Volume ── */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setMuted(v => !v)}
            className="rounded-full p-2 text-white/35 transition hover:bg-white/8 hover:text-white"
            title="Toggle mute"
          >
            {effectiveVolume === 0 ? (
              <SpeakerXMarkIcon className="size-4" />
            ) : (
              <SpeakerWaveIcon className="size-4" />
            )}
          </button>
          <div
            onClick={seekVolume}
            className="group relative h-1 w-24 cursor-pointer rounded-full bg-white/12"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-white/50 transition-all"
              style={{ width: `${effectiveVolume * 100}%` }}
            />
            <div
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `${effectiveVolume * 100}%` }}
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={current?.preview_url ?? undefined}
        onPlay={() => { setPlaying(true); setBuffering(false); }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => onEnded(repeatMode)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => { if (!dragging) setProgress(audioRef.current?.currentTime ?? 0); }}
        onError={() => { setPlaying(false); setBuffering(false); }}
      />
    </footer>
  );
}

/** Animated equalizer bars shown on artwork hover when playing */
function EqBars() {
  const heights = [10, 16, 8, 14];
  const delays = ["0ms", "120ms", "60ms", "180ms"];
  return (
    <>
      {heights.map((h, i) => (
        <div
          key={i}
          className="eq-bar w-[2px] rounded-full bg-[#ff6b57]"
          style={{ height: `${h}px`, animationDelay: delays[i], animationDuration: `${0.4 + i * 0.08}s` }}
        />
      ))}
    </>
  );
}

function formatTime(value: number) {
  const safe = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
