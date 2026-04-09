"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { BrainCircuit, Play } from "lucide-react";
import { useAudio } from "@/lib/AudioContext";
import { getTracksByMood, Track } from "@/lib/recommendations";

const MOODS = [
    { id: "focus", label: "Deep Focus", color: "from-blue-500 to-cyan-500", shadow: "rgba(59,130,246,0.5)", angle: -90 },
    { id: "gym", label: "Beast Mode", color: "from-red-500 to-orange-500", shadow: "rgba(239,68,68,0.5)", angle: -18 },
    { id: "chill", label: "Late Night Chill", color: "from-purple-500 to-indigo-500", shadow: "rgba(168,85,247,0.5)", angle: 54 },
    { id: "drive", label: "Night Drive", color: "from-pink-500 to-rose-500", shadow: "rgba(236,72,153,0.5)", angle: 126 },
    { id: "uplift", label: "Euphoria", color: "from-yellow-400 to-orange-500", shadow: "rgba(250,204,21,0.5)", angle: 198 },
];

export function MoodDiscovery() {
    const { playTrack } = useAudio();
    const [activeMood, setActiveMood] = useState(MOODS[0]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMoodTracks = async () => {
            setIsLoading(true);
            try {
                const results = await getTracksByMood(activeMood.id);
                setTracks(results.slice(0, 5));
            } catch (err) {
                console.error("Mood fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMoodTracks();
    }, [activeMood]);

    const handleMoodSelect = (mood: typeof MOODS[0]) => {
        setIsSpinning(true);
        setActiveMood(mood);
        setTimeout(() => setIsSpinning(false), 800);
    };

    return (
        <section className="w-full flex flex-col lg:flex-row gap-16 py-20 px-4 md:px-8 items-center justify-center min-h-[600px] relative">

            {/* Dynamic Background Glow based on active mood */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMood.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1 }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br ${activeMood.color} blur-[120px]`}
                    />
                </AnimatePresence>
            </div>

            {/* Mood Wheel */}
            <div className="relative w-[350px] h-[350px] shrink-0 flex items-center justify-center">
                {/* Core Center */}
                <div className="absolute z-20 w-32 h-32 rounded-full bg-black/60 backdrop-blur-xl border-2 border-white/10 flex flex-col items-center justify-center shadow-2xl">
                    <BrainCircuit className="w-8 h-8 text-white/80 mb-1" />
                    <span className="text-xs font-bold tracking-widest text-white/50">MOOD</span>
                </div>

                {/* The Wheel */}
                <motion.div
                    className="w-full h-full relative"
                    animate={{ rotate: isSpinning ? activeMood.angle + 360 : activeMood.angle }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    {MOODS.map((mood) => {
                        const radius = 140; // distance from center
                        // Convert angle to radians for positioning, offset by current rotation
                        const rad = (mood.angle * Math.PI) / 180;
                        const x = Math.cos(rad) * radius;
                        const y = Math.sin(rad) * radius;
                        const isActive = activeMood.id === mood.id;

                        return (
                            <motion.button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood)}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    x, y,
                                    // Counter-rotate the button so text stays upright
                                    rotate: -activeMood.angle
                                }}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    opacity: isActive ? 1 : 0.5,
                                    rotate: -activeMood.angle // Ensure it stays upright during wheel rotation
                                }}
                                whileHover={{ scale: 1.1, opacity: 0.8 }}
                            >
                                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center relative bg-gradient-to-br ${mood.color} shadow-lg border border-white/20 backdrop-blur-md`}>
                                    <span className="text-xs font-bold text-white text-center leading-tight drop-shadow-md px-1">{mood.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-mood-ring"
                                            className="absolute -inset-2 rounded-full border border-white/50 border-dashed animate-[spin_4s_linear_infinite]"
                                        />
                                    )}
                                    {/* Static glow for active */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full opacity-50 blur-lg" style={{ backgroundColor: mood.shadow }} />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* Mood Details / Generated Playlist Preview */}
            <div className="flex-1 max-w-lg w-full flex flex-col gap-6 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMood.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <h3 className="text-4xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r text-white">
                                {activeMood.label}
                            </h3>
                            <p className="text-white/60 text-lg">AI has crafted the perfect sonic landscape for your current state of mind.</p>
                        </div>

                        <GlassCard className="p-6 flex flex-col gap-4" glowOnHover={false}>
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${activeMood.color} flex items-center justify-center shadow-lg`}>
                                        <Play className="w-5 h-5 text-white fill-current ml-1" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">Generated Sequence</span>
                                        <span className="text-xs text-white/50">2 hours • High affinity</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                                    Save Playlist
                                </button>
                            </div>

                            {/* Real-time Tracklist */}
                            <div className="flex flex-col gap-3 min-h-[200px]">
                                {isLoading ? (
                                    <div className="flex flex-col gap-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                                                <div className="w-8 h-8 rounded bg-white/5" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 bg-white/10 rounded w-1/2" />
                                                    <div className="h-2 bg-white/5 rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : tracks.map((track, i) => (
                                    <div 
                                        key={track.id} 
                                        onClick={() => playTrack(track)}
                                        className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-white/30 text-sm w-4">{i + 1}</span>
                                            <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                                                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="w-4 h-4 fill-current text-white" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col truncate max-w-[180px]">
                                                <span className="text-sm font-bold text-white/90 truncate">{track.title}</span>
                                                <span className="text-[10px] text-white/40 truncate">{track.artist}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-white/30">0:30</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                    </motion.div>
                </AnimatePresence>
            </div>

        </section>
    );
}
