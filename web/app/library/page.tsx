"use client";

import { motion } from "framer-motion";
import { Library, Heart, History, Clock, Play, MoreHorizontal, Music2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/lib/AuthContext";
import { useAudio } from "@/lib/AudioContext";
import { TRACK_LIBRARY } from "@/lib/recommendations";

export default function LibraryPage() {
    const { user } = useAuth();
    const { playTrack } = useAudio();
    
    // In a real app, we'd fetch these from the database
    const likedTracks = TRACK_LIBRARY.slice(5, 12);
    const recentActivity = user?.listeningHistory?.slice(-10).reverse() || [];

    return (
        <div className="flex flex-col gap-12 p-8 pb-32">
            <div className="flex items-end gap-6">
                <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl flex items-center justify-center border border-white/10 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                    <Library className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform relative z-20" />
                </div>
                <div className="flex flex-col gap-2 mb-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/40">Personal Collection</span>
                    <h1 className="text-7xl font-black tracking-tighter">YOUR LIBRARY</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex -space-x-2">
                            {likedTracks.slice(0, 3).map((t, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-black bg-white/10 overflow-hidden">
                                    <img src={t.cover} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-white/60 text-sm font-medium">85 Tracks • 4 Playlists</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 pb-4">
                {["Overview", "Playlists", "Artists", "Albums", "Songs"].map((tab) => (
                    <button key={tab} className={`text-sm font-bold uppercase tracking-widest transition-colors ${tab === "Overview" ? "text-white" : "text-white/40 hover:text-white"}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Favorites */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                            Liked Songs
                        </h2>
                        <button className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">View All</button>
                    </div>

                    <div className="flex flex-col gap-1">
                        {likedTracks.map((track, i) => (
                            <motion.div 
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                onClick={() => playTrack(track as any)}
                            >
                                <span className="text-white/20 font-mono w-4">{i + 1}</span>
                                <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-5 h-5 fill-current text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 truncate">
                                    <span className="font-bold text-sm text-white/90">{track.title}</span>
                                    <span className="text-xs text-white/40">{track.artist}</span>
                                </div>
                                <button className="text-white/20 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <History className="w-6 h-6 text-blue-400" />
                            Recent History
                        </h2>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col gap-6">
                        {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div 
                                    className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group/item relative"
                                    onClick={() => playTrack({
                                        id: item.trackId,
                                        title: item.trackTitle,
                                        artist: item.artist,
                                        cover: item.cover || '',
                                        url: (item as any).url || ''
                                    })}
                                >
                                    {item.cover ? (
                                        <img src={item.cover} alt={item.trackTitle} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music2 className="w-4 h-4 text-white/20" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-4 h-4 fill-current text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col truncate flex-1">
                                    <span className="text-sm font-bold text-white/80 truncate">{item.trackTitle}</span>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                        <Clock className="w-3 h-3" />
                                        <span>Just now</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                                <div 
                                    className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group/item relative"
                                    onClick={() => playTrack({
                                        id: item.trackId,
                                        title: item.trackTitle,
                                        artist: item.artist,
                                        cover: (item as any).cover || '',
                                        url: (item as any).url || ''
                                    })}
                                >
                                    {(item as any).cover ? (
                                        <img src={(item as any).cover} alt={item.trackTitle} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music2 className="w-4 h-4 text-white/20" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-4 h-4 fill-current text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-white/30 px-4">Your listening history will appear here once you start exploring.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
