"use client";

import { motion } from "framer-motion";
import { Compass, Sparkles, TrendingUp, Music2, Search, Play } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { getTrendingTracks, Track } from "@/lib/recommendations";
import { useAudio } from "@/lib/AudioContext";
import { useState, useEffect } from "react";

const CATEGORIES = [
    { label: "Top Charts", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { label: "New Releases", icon: Sparkles, color: "from-blue-500 to-cyan-500" },
    { label: "Genre Explorer", icon: Music2, color: "from-emerald-400 to-teal-500" },
];

const GENRES = ["Synthwave", "Lo-Fi", "Indie Rock", "Pop", "Electronic", "Ambient", "Jazz", "R&B"];

export default function DiscoverPage() {
    const { playTrack } = useAudio();
    const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            const data = await getTrendingTracks(10);
            setTrendingTracks(data);
            setLoading(false);
        };
        fetchTrending();
    }, []);

    return (
        <div className="flex flex-col gap-12 p-8 pb-32">
            {/* Hero Section */}
            <div className="relative h-[300px] rounded-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 mix-blend-multiply" />
                <img 
                    src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=1200" 
                    alt="Discover" 
                    className="absolute inset-0 w-full h-full object-cover -z-10 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="relative h-full flex flex-col justify-center px-12 gap-4">
                    <div className="flex items-center gap-3 text-purple-300 font-bold uppercase tracking-widest text-sm">
                        <Compass className="w-5 h-5" />
                        <span>Discover New Sounds</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white uppercase">
                        EXPLORE THE <br/>RESONANCE
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl">
                        AI-curated selections powered by iTunes. Find your next favorite track today.
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CATEGORIES.map((cat, i) => (
                    <GlassCard key={i} className="p-6 cursor-pointer group overflow-hidden bg-white/5 border-white/10" glowOnHover>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-white transition-colors">{cat.label}</h3>
                        <p className="text-white/40 text-sm mt-2">Explore the latest and greatest in the world of {cat.label.toLowerCase()}.</p>
                    </GlassCard>
                ))}
            </div>

            {/* Trending Now */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold uppercase tracking-tight">Trending Now</h2>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60">
                        <Search className="w-4 h-4" />
                        <span>Search genres...</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-2xl" />
                        ))
                    ) : trendingTracks.map((track, i) => (
                        <motion.div 
                            key={track.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col gap-3 group items-center text-center cursor-pointer"
                            onClick={() => playTrack(track)}
                        >
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <Play className="w-6 h-6 fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className="font-bold text-white/90 truncate w-full">{track.title}</span>
                                <span className="text-xs text-white/40 truncate w-full">{track.artist}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Genre Explorer */}
            <div className="flex flex-col gap-6 pb-12">
                <h2 className="text-3xl font-bold uppercase tracking-tight">Genre Explorer</h2>
                <div className="flex flex-wrap gap-3">
                    {GENRES.map((genre) => (
                        <button 
                            key={genre}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white/80"
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
