"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Music, Mic2, Tag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchMassiveLibrary, Track } from "@/lib/recommendations";
import { useAudio } from "@/lib/AudioContext";

const SUGGESTIONS = [
    { id: 1, type: "song", text: "Resonance - HOME", icon: Music, color: "text-blue-400" },
    { id: 2, type: "mood", text: "Late Night Drive", icon: Sparkles, color: "text-purple-400" },
    { id: 3, type: "genre", text: "Synthwave / Retrowave", icon: Tag, color: "text-pink-400" },
    { id: 4, type: "artist", text: "Kavinsky", icon: Mic2, color: "text-emerald-400" },
];

export function SmartSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Track[]>([]);
    const { playTrack } = useAudio();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Keyboard shortcut CMD+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim()) {
                setIsLoading(true);
                try {
                    const { searchMusicAPI } = await import("@/lib/recommendations");
                    const searchResults = await searchMusicAPI(query);
                    setResults(searchResults);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        };

        const timer = setTimeout(fetchResults, 300); // Debounce
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelectTrack = (track: Track) => {
        playTrack(track);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-12 pr-6 text-sm text-white/40 focus:outline-none transition-all flex items-center justify-between group"
            >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                </div>
                <span>Search {new Intl.NumberFormat().format(100000)}+ and AI suggestions...</span>
                <div className="flex gap-1 text-xs font-mono font-medium">
                    <kbd className="bg-black/40 px-2 py-1 rounded border border-white/10">⌘</kbd>
                    <kbd className="bg-black/40 px-2 py-1 rounded border border-white/10">K</kbd>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input Area */}
                            <div className="flex items-center px-4 py-4 border-b border-white/10 relative">
                                <Search className="w-6 h-6 text-white/50 mr-4" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search 100k+ songs, artists, moods..."
                                    className="flex-1 bg-transparent text-xl text-white placeholder:text-white/30 focus:outline-none"
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs font-medium"
                                >
                                    ESC
                                </button>
                            </div>

                            {/* Results Area */}
                            <div className="flex flex-col p-2 max-h-[60vh] overflow-y-auto min-h-[400px]">
                                {query.length === 0 ? (
                                    <div className="flex flex-col gap-1">
                                        <p className="px-4 py-2 text-xs font-semibold text-white/40 tracking-wider">POPULAR SUGGESTIONS</p>
                                        {SUGGESTIONS.map((sug, idx) => (
                                            <motion.button
                                                key={sug.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => setQuery(sug.text)}
                                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-left group transition-colors"
                                            >
                                                <div className={cn("w-8 h-8 rounded-full bg-white/5 flex items-center justify-center", sug.color)}>
                                                    <sug.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-white/90 font-medium">{sug.text}</span>
                                                    <span className="text-xs text-white/40 capitalize">{sug.type}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors transform group-hover:translate-x-1" />
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between px-4 py-2">
                                            <p className="text-xs font-semibold text-white/40 tracking-wider uppercase">
                                                {isLoading ? "Searching iTunes..." : "Search Results"}
                                            </p>
                                            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">REAL-TIME API</span>
                                        </div>
                                        {results.map((track, idx) => (
                                            <motion.button
                                                key={track.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                onClick={() => handleSelectTrack(track)}
                                                className="flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-white/5 text-left group transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-white/90 font-medium truncate">{track.title}</span>
                                                    <span className="text-xs text-white/40 truncate">{track.artist} • {track.genre}</span>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                        <Music className="w-4 h-4 fill-current" />
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                        {results.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full py-20 gap-4 opacity-50">
                                                <Search className="w-8 h-8 text-white/20" />
                                                <p className="text-sm font-medium">No matches found in 100k+ library</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
