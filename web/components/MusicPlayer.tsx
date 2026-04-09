"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Repeat, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/AudioContext";

export function MusicPlayer() {
    const { currentTrack: trackFromContext, isPlaying, togglePlay, progress, duration, volume, setVolume, seek } = useAudio();
    const [isExpanded, setIsExpanded] = useState(false);

    // Default track if none selected
    const defaultTrack = {
        title: "Neon Echoes",
        artist: "Synthwave Collective",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&h=200&auto=format&fit=crop",
        color: "from-purple-500",
    };

    const track = trackFromContext || defaultTrack;

    return (
        <motion.div
            layout
            data-expanded={isExpanded}
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-2xl md:rounded-full transition-all duration-500",
                isExpanded ? "w-[90vw] md:w-[600px] p-6" : "w-[90vw] md:w-[700px] h-20 px-6 py-4 flex items-center gap-6"
            )}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none -z-10">
                <motion.div
                    className={cn("absolute inset-0 bg-gradient-to-r to-transparent opacity-20 transition-colors duration-1000", track.color || "from-purple-500")}
                    animate={{
                        opacity: isPlaying ? [0.1, 0.3, 0.1] : 0.1,
                        scale: isPlaying ? [1, 1.1, 1] : 1
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <AnimatePresence mode="popLayout">
                {!isExpanded ? (
                    <motion.div
                        key="collapsed"
                        className="flex items-center w-full gap-6 h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Album Art & Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer" onClick={() => setIsExpanded(true)}>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={track.cover} alt={track.title} className={cn("w-full h-full object-cover", isPlaying && "animate-[spin_10s_linear_infinite]")} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="font-semibold text-white/90 truncate">{track.title}</span>
                                <span className="text-xs text-white/50 truncate">{track.artist}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            <button className="text-white/50 hover:text-white transition-colors hidden md:block"><Shuffle className="w-4 h-4" /></button>
                            <button className="text-white/80 hover:text-white transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>

                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </button>

                            <button className="text-white/80 hover:text-white transition-colors"><SkipForward className="w-5 h-5 fill-current" /></button>
                            <button className="text-white/50 hover:text-white transition-colors hidden md:block"><Repeat className="w-4 h-4" /></button>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 items-center gap-3 hidden md:flex min-w-[150px]">
                            <span className="text-xs text-white/40 tabular-nums">{Math.floor(progress * duration / 6000)}:{(Math.floor(progress * duration / 100) % 60).toString().padStart(2, '0')}</span>
                            <div className="flex-1 relative group h-6 flex items-center">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={progress} 
                                    onChange={(e) => seek(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-pink-500 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                            <span className="text-xs text-white/40 tabular-nums">{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 w-24">
                            <Volume2 className="w-4 h-4 text-white/50" />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/40 hover:accent-white transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        className="flex flex-col w-full h-full gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Expanded Top */}
                        <div className="flex items-center justify-between">
                            <button onClick={() => setIsExpanded(false)} className="text-white/50 hover:text-white transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 rotate-90" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-white/50 font-bold">Now Playing from</span>
                                <span className="text-xs font-bold text-white/90">Neon Mix</span>
                            </div>
                            <button className="text-white/50 hover:text-white transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="5" r="1" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="19" r="1" stroke="currentColor" strokeWidth="2" /></svg>
                            </button>
                        </div>

                        {/* Expanded Album Art */}
                        <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex flex-col gap-1 items-center text-center">
                            <h3 className="text-2xl font-bold">{track.title}</h3>
                            <p className="text-lg text-white/60">{track.artist}</p>
                        </div>

                        {/* Expanded Timeline */}
                        <div className="flex flex-col gap-2">
                            <div className="h-4 w-full flex items-center relative cursor-pointer">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={progress} 
                                    onChange={(e) => seek(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-pink-500 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/50 font-medium font-mono">
                                <span>{Math.floor(progress * duration / 6000)}:{(Math.floor(progress * duration / 100) % 60).toString().padStart(2, '0')}</span>
                                <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>

                        {/* Expanded Controls */}
                        <div className="flex items-center justify-between px-4">
                            <button className="text-white/50 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
                            <button className="text-white/80 hover:text-white transition-colors"><SkipBack className="w-8 h-8 fill-current" /></button>

                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>

                            <button className="text-white/80 hover:text-white transition-colors"><SkipForward className="w-8 h-8 fill-current" /></button>
                            <button className="text-white/50 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
