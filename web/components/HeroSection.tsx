"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { GlassCard } from "./GlassCard";

const floatingAlbums = [
    { id: 1, url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop", delay: 0, x: -150, y: -50, rotate: -10, scale: 0.9 },
    { id: 2, url: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=400&h=400&auto=format&fit=crop", delay: 0.2, x: 150, y: -20, rotate: 15, scale: 1 },
    { id: 3, url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&h=400&auto=format&fit=crop", delay: 0.4, x: -80, y: 100, rotate: 5, scale: 0.8 },
];

export function HeroSection() {
    return (
        <section className="relative min-h-[60vh] w-full flex items-center justify-center pt-20 pb-10 mb-20">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-600/30 via-blue-600/20 to-pink-600/30 blur-[100px] rounded-full" />
            </div>

            <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-sm font-medium tracking-wide text-white/80 uppercase">AI-Powered Discovery Engine</span>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                >
                    Listen to the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                        Future of Sound
                    </span>
                </motion.h1>

                <motion.p
                    className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Experience hyper-personalized music curation driven by deep neural networks.
                    Your taste, mathematically mapped to infinite possibilities.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                >
                    <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                            <Play className="w-5 h-5 fill-current" />
                            <span>Start Discovery Radio</span>
                        </div>
                    </button>
                </motion.div>
            </div>

            {/* Floating Elements Background */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
                {floatingAlbums.map((album) => (
                    <motion.div
                        key={album.id}
                        className="absolute top-1/2 left-1/2 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                        animate={{
                            opacity: 0.6,
                            x: album.x,
                            y: album.y,
                            scale: album.scale,
                            rotate: album.rotate
                        }}
                        transition={{
                            duration: 2,
                            delay: album.delay,
                            type: "spring",
                            stiffness: 50,
                            damping: 20
                        }}
                    >
                        <motion.div
                            className="w-full h-full"
                            animate={{
                                y: [0, -15, 0],
                                rotate: [album.rotate, album.rotate + 3, album.rotate],
                            }}
                            transition={{
                                duration: 6 + album.id,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={album.url} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 border border-white/20 rounded-2xl mix-blend-overlay" />
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
