"use client";

import { motion } from "framer-motion";
import { Play, Plus, Heart } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useAudio } from "@/lib/AudioContext";
import { getRecommendedSections } from "@/lib/recommendations";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function RecommendationEngine() {
    const { playTrack } = useAudio();
    const sections = getRecommendedSections();

    return (
        <section className="flex flex-col gap-16 w-full py-10">
            {sections.map((section: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-6">
                    <motion.h2
                        className="text-2xl font-bold tracking-tight px-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {section.title}
                    </motion.h2>

                    <motion.div
                        className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 snap-x snap-mandatory hide-scroll"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {section.items.map((item: any) => (
                            <motion.div key={item.id} variants={itemVariants} className="snap-start shrink-0">
                                <GlassCard 
                                    className="w-48 p-4 group flex flex-col gap-4 cursor-pointer" 
                                    glowOnHover
                                    onClick={() => playTrack(item as any)}
                                >
                                    <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform translate-y-4 group-hover:translate-y-0 duration-300">
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
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-semibold text-white/90 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-white/50 truncate">{item.artist}</p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            ))}
        </section>
    );
}
