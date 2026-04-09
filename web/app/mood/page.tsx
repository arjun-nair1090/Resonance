"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, Search, Radio, Ghost, Headphones, Zap, Coffee, Moon } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { TRACK_LIBRARY } from "@/lib/recommendations";
import { useAudio } from "@/lib/AudioContext";
import { useState } from "react";

const MOODS = [
    { label: "Energetic", icon: Zap, color: "from-yellow-400 to-orange-500", desc: "For your most intense workouts and focus sessions." },
    { label: "Chill", icon: Coffee, color: "from-emerald-400 to-teal-500", desc: "Unwind and relax with low-tempo grooves." },
    { label: "Melancholic", icon: Moon, color: "from-blue-600 to-indigo-700", desc: "Soulful tracks for when you're feeling reflective." },
    { label: "Happy", icon: Sparkles, color: "from-pink-500 to-rose-400", desc: "Pure joy captured in sound." },
    { label: "Focused", icon: Headphones, color: "from-cyan-400 to-blue-500", desc: "Deep flow for coding, studying, or creating." },
    { label: "Mysterious", icon: Ghost, color: "from-purple-600 to-fuchsia-800", desc: "Dark textures and enigmatic sounds." },
];

export default function MoodPage() {
    const { playTrack } = useAudio();
    const [selectedMood, setSelectedMood] = useState(MOODS[0]);

    const filteredTracks = TRACK_LIBRARY.filter(t => t.mood.toLowerCase() === selectedMood.label.toLowerCase() || t.tags.includes(selectedMood.label.toLowerCase())).slice(0, 12);

    return (
        <div className="flex flex-col gap-12 p-8 pb-32">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-sm">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span>Live Mood Station</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight">SET YOUR VIBE</h1>
                <p className="text-white/60 text-lg max-w-2xl">
                    Our AI scans thousands of tracks to find the perfect matches for your current emotional state.
                </p>
            </div>

            {/* Mood Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {MOODS.map((mood, i) => {
                    const isSelected = selectedMood.label === mood.label;
                    return (
                        <GlassCard 
                            key={i} 
                            onClick={() => setSelectedMood(mood)}
                            className={`p-6 cursor-pointer group flex flex-col items-center text-center gap-4 transition-all duration-300 ${isSelected ? 'border-white/40 ring-2 ring-white/10 scale-105' : 'border-white/5 opacity-60 hover:opacity-100'}`} 
                            glowOnHover
                        >
                            <div className={`p-4 rounded-full bg-gradient-to-br ${mood.color} text-white shadow-xl`}>
                                <mood.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold">{mood.label}</span>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Selected Mood Section */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedMood.color}`} />
                        {selectedMood.label} Station
                    </h2>
                    <p className="text-white/40">{selectedMood.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTracks.length > 0 ? filteredTracks.map((track, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => playTrack(track as any)}
                        >
                            <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play className="w-6 h-6 fill-current text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 truncate">
                                <span className="font-bold text-white/90">{track.title}</span>
                                <span className="text-xs text-white/40">{track.artist}</span>
                            </div>
                            <div className="text-xs text-white/20 font-mono">
                                {(track as any).tempo} BPM
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center text-white/20">
                            <Headphones className="w-12 h-12 mb-4" />
                            <p>No tracks found for this mood yet. Try another one!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
