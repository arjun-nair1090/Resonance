"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Plus, Heart, MapPin, Clock, Sparkles, Brain, Sun, Moon, CloudSun, Sunset, Star } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useAuth } from "@/lib/AuthContext";
import { useAudio } from "@/lib/AudioContext";
import { getTimeOfDay } from "@/lib/auth";
import {
    getAllRecommendations,
    Track,
    getTimeBasedRecommendations,
    getLocationBasedRecommendations,
} from "@/lib/recommendations";

const LOCATION_VIBES = [
    { id: "urban", label: "City", icon: "🏙️" },
    { id: "beach", label: "Beach", icon: "🏖️" },
    { id: "mountains", label: "Mountains", icon: "🏔️" },
    { id: "cozy", label: "Home", icon: "🏠" },
    { id: "commute", label: "Commute", icon: "🚗" },
];

const timeIcons: Record<string, typeof Sun> = {
    morning: Sun,
    afternoon: CloudSun,
    evening: Sunset,
    night: Moon,
    lateNight: Star,
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function TrackCard({ track, index }: { track: Track; index: number }) {
    const { playTrack } = useAudio();
    return (
        <motion.div variants={itemVariants} className="snap-start shrink-0">
            <GlassCard className="w-48 p-4 group flex flex-col gap-4 cursor-pointer" glowOnHover>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                            <Play className="w-5 h-5 fill-current ml-1" />
                        </button>
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 delay-100">
                        <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-white/20 hover:text-pink-400 text-white transition-colors">
                            <Heart className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mood/genre tag */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                        {track.mood}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-white/90 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-colors text-sm">
                        {track.title}
                    </h3>
                    <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function RecommendationSection({
    title,
    subtitle,
    tracks,
    icon,
    accentColor,
}: {
    title: string;
    subtitle: string;
    tracks: Track[];
    icon: React.ReactNode;
    accentColor: string;
}) {
    if (tracks.length === 0) return null;

    return (
        <div className="flex flex-col gap-5">
            <motion.div
                className="flex items-center gap-4 px-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className={`w-10 h-10 rounded-xl ${accentColor} flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <p className="text-sm text-white/50">{subtitle}</p>
                </div>
            </motion.div>

            <motion.div
                className="flex gap-5 overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
            >
                {tracks.map((track, i) => (
                    <TrackCard key={track.id + i} track={track} index={i} />
                ))}
            </motion.div>
        </div>
    );
}

export function ContextualRecommendations() {
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [activeVibe, setActiveVibe] = useState("urban");
    const [timeData, setTimeData] = useState<{ period: string; greeting: string; emoji: string } | null>(null);
    const [timeBased, setTimeBased] = useState<{ title: string; subtitle: string; tracks: Track[] } | null>(null);
    const [locationBased, setLocationBased] = useState<{ title: string; subtitle: string; tracks: Track[] } | null>(null);
    const [personalized, setPersonalized] = useState<{ title: string; subtitle: string; tracks: Track[] } | null>(null);
    const [timePattern, setTimePattern] = useState<{ title: string; subtitle: string; tracks: Track[] } | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const data = getAllRecommendations(user, activeVibe);
        setTimeBased(data.timeBased);
        setLocationBased(data.locationBased);
        setPersonalized(data.personalized);
        setTimePattern(data.timePattern);
        setTimeData(getTimeOfDay());
    }, [user, activeVibe]);

    const handleVibeChange = (vibeId: string) => {
        setActiveVibe(vibeId);
        // Data will be updated by the main useEffect
    };

    if (!isMounted || !timeData) return (
        <div className="w-full flex flex-col gap-12 py-10 animate-pulse">
            <div className="h-12 w-1/3 bg-white/5 rounded-2xl" />
            <div className="h-64 w-full bg-white/5 rounded-3xl" />
        </div>
    );

    const TimeIcon = timeIcons[timeData.period] || Clock;

    return (
        <section className="flex flex-col gap-14 w-full py-6">
            {/* Personalized greeting */}
            {user && (
                <motion.div
                    className="flex flex-col gap-2 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{timeData.emoji}</span>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {timeData.greeting},{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                {user.name.split(" ")[0]}
                            </span>
                        </h1>
                    </div>
                    <p className="text-white/50 text-base pl-12">
                        Here&apos;s what we recommend based on your taste, time, and vibe
                    </p>
                </motion.div>
            )}

            {/* Time-Based */}
            {timeBased && timeBased.tracks.length > 0 && (
                <RecommendationSection
                    title={timeBased.title}
                    subtitle={timeBased.subtitle}
                    tracks={timeBased.tracks}
                    icon={<TimeIcon className="w-5 h-5 text-white" />}
                    accentColor="bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/20"
                />
            )}

            {/* Location Vibe Selector + Results */}
            <div className="flex flex-col gap-6">
                <motion.div
                    className="flex items-center gap-4 px-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Location Vibes</h2>
                        <p className="text-sm text-white/50">Pick your vibe, get the perfect playlist</p>
                    </div>
                </motion.div>

                <div className="flex gap-3 px-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {LOCATION_VIBES.map(vibe => (
                        <motion.button
                            key={vibe.id}
                            onClick={() => handleVibeChange(vibe.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                                activeVibe === vibe.id
                                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                    : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="text-lg">{vibe.icon}</span>
                            {vibe.label}
                        </motion.button>
                    ))}
                </div>

                {locationBased && locationBased.tracks.length > 0 && (
                    <motion.div
                        className="flex gap-5 overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        key={activeVibe}
                    >
                        {locationBased.tracks.map((track, i) => (
                            <TrackCard key={track.id + i} track={track} index={i} />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Time Pattern — "What you usually listen to at this time" */}
            {timePattern && timePattern.tracks.length > 0 && (
                <RecommendationSection
                    title={timePattern.title}
                    subtitle={timePattern.subtitle}
                    tracks={timePattern.tracks}
                    icon={<Brain className="w-5 h-5 text-white" />}
                    accentColor="bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20"
                />
            )}

            {/* Personalized — "Made For You" */}
            {personalized && personalized.tracks.length > 0 && (
                <RecommendationSection
                    title={personalized.title}
                    subtitle={personalized.subtitle}
                    tracks={personalized.tracks}
                    icon={<Sparkles className="w-5 h-5 text-white" />}
                    accentColor="bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/20"
                />
            )}
        </section>
    );
}
