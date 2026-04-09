"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { GripVertical, Play, Trash2, Wand2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_TRACKS = [
    { id: "1", title: "Resonance", artist: "HOME", duration: "3:32", highlight: true, reason: "Matches your recent 'Chill' vibe" },
    { id: "2", title: "Midnight City", artist: "M83", duration: "4:03", highlight: false },
    { id: "3", title: "Nightcall", artist: "Kavinsky", duration: "4:19", highlight: true, reason: "98% affinity with your library" },
    { id: "4", title: "Sunset", artist: "The Midnight", duration: "5:26", highlight: false },
    { id: "5", title: "Odd Look", artist: "Kavinsky", duration: "4:18", highlight: false },
];

export function PlaylistBuilder() {
    const [tracks, setTracks] = useState(INITIAL_TRACKS);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAutoGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            // Simulate AI reordering and adding transition tracks
            const newTracks = [
                ...INITIAL_TRACKS,
                { id: "6", title: "Lost in Translation", artist: "Logic1000", duration: "4:12", highlight: true, reason: "AI suggested transition track" }
            ].sort(() => Math.random() - 0.5);
            setTracks(newTracks);
            setIsGenerating(false);
        }, 1500);
    };

    const removeTrack = (id: string) => {
        setTracks(tracks.filter(t => t.id !== id));
    };

    return (
        <section className="w-full py-10 px-4 md:px-8 max-w-5xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Sonic Architect
                    </h2>
                    <p className="text-white/60 text-lg">Shape your narrative. Drag to reorder your journey.</p>
                </div>
                <button
                    onClick={handleAutoGenerate}
                    disabled={isGenerating}
                    className="group relative px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium transition-all overflow-hidden flex items-center gap-2"
                >
                    {isGenerating ? (
                        <Wand2 className="w-4 h-4 text-purple-400 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                    )}
                    <span>{isGenerating ? "Synthesizing Flow..." : "Auto-Optimize Flow"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <GlassCard className="p-4 md:p-8 flex flex-col gap-6" glowOnHover={false}>
                {/* Header Row */}
                <div className="flex items-center text-xs font-semibold text-white/40 tracking-wider pb-4 border-b border-white/10 px-4">
                    <div className="w-8" /> {/* Drag handle spacer */}
                    <div className="flex-1">TITLE</div>
                    <div className="hidden md:block w-48">ARTIST</div>
                    <div className="w-16 text-right">TIME</div>
                    <div className="w-10" /> {/* Actions spacer */}
                </div>

                {/* Draggable List */}
                <Reorder.Group axis="y" values={tracks} onReorder={setTracks} className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                        {tracks.map((track) => (
                            <Reorder.Item
                                key={track.id}
                                value={track}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                className={cn(
                                    "flex items-center p-4 rounded-xl relative group bg-white/5 border border-white/5 hover:bg-white/10 transition-colors",
                                    track.highlight && "shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/30",
                                    "cursor-grab active:cursor-grabbing backdrop-blur-sm"
                                )}
                            >
                                {/* Highlight Glow bg */}
                                {track.highlight && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl pointer-events-none" />
                                )}

                                {/* Drag Handle */}
                                <div className="w-8 shrink-0 text-white/30 group-hover:text-white/60 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Title & AI Tooltip */}
                                <div className="flex-1 flex items-center gap-3 relative min-w-0">
                                    <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-colors group/play">
                                        <Play className="w-3 h-3 fill-current ml-0.5 opacity-50 group-hover/play:opacity-100" />
                                    </button>
                                    <span className="font-medium text-white/90 truncate">{track.title}</span>

                                    {track.highlight && (
                                        <div className="relative group/info flex shrink-0">
                                            <Info className="w-4 h-4 text-purple-400 hidden sm:block" />
                                            <div className="absolute left-1/2 -top-10 -translate-x-1/2 bg-black/90 border border-purple-500/30 text-xs px-3 py-1.5 rounded text-white/80 whitespace-nowrap opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl backdrop-blur-md">
                                                {track.reason}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Artist */}
                                <div className="hidden md:block w-48 text-white/50 text-sm truncate pr-4">
                                    {track.artist}
                                </div>

                                {/* Duration */}
                                <div className="w-16 text-right text-white/50 text-sm font-mono">
                                    {track.duration}
                                </div>

                                {/* Remove Action */}
                                <div className="w-10 flex justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {tracks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                            <span className="text-2xl">+</span>
                        </div>
                        <p>Drop tracks here to start building your journey</p>
                    </div>
                )}
            </GlassCard>
        </section>
    );
}
