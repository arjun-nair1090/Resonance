"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";

const TASTE_NODES = [
    { id: "synth", label: "Synthwave", x: 20, y: 30, size: 120, color: "from-purple-500 to-indigo-500", affinity: 98 },
    { id: "cyber", label: "Cyberpunk", x: 60, y: 20, size: 90, color: "from-blue-500 to-cyan-500", affinity: 85 },
    { id: "lofi", label: "Lofi Beats", x: 80, y: 60, size: 100, color: "from-pink-500 to-rose-400", affinity: 92 },
    { id: "ambient", label: "Ambient", x: 15, y: 70, size: 80, color: "from-emerald-400 to-teal-500", affinity: 75 },
    { id: "french", label: "French House", x: 45, y: 80, size: 110, color: "from-orange-400 to-red-500", affinity: 88 },
];

export function TasteMap() {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <section className="w-full flex flex-col gap-8 py-10 px-4 md:px-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">AI Taste Map</h2>
                <p className="text-white/60 text-lg">Your musical DNA visualized in real-time</p>
            </div>

            <GlassCard glowOnHover={false} className="w-full h-[500px] relative overflow-hidden bg-black/20 p-8 border-white/5">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Connections (Mocked with SVGs) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                        d="M 20 30 Q 40 25 60 20"
                        stroke="url(#gradient-1)" strokeWidth="0.5" fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M 60 20 Q 70 40 80 60"
                        stroke="url(#gradient-2)" strokeWidth="0.5" fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M 20 30 Q 30 55 45 80"
                        stroke="url(#gradient-3)" strokeWidth="0.5" fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="gradient-1"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                        <linearGradient id="gradient-2"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
                        <linearGradient id="gradient-3"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#fb923c" /></linearGradient>
                    </defs>
                </svg>

                {/* Nodes */}
                {TASTE_NODES.map((node) => {
                    const isHovered = hoveredNode === node.id;
                    const isDimmed = hoveredNode !== null && hoveredNode !== node.id;

                    return (
                        <motion.div
                            key={node.id}
                            className="absolute cursor-pointer"
                            style={{
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                x: "-50%",
                                y: "-50%"
                            }}
                            onHoverStart={() => setHoveredNode(node.id)}
                            onHoverEnd={() => setHoveredNode(null)}
                            animate={{
                                opacity: isDimmed ? 0.3 : 1,
                                scale: isHovered ? 1.1 : 1,
                                zIndex: isHovered ? 50 : 10
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.div
                                className={`relative rounded-full flex items-center justify-center bg-gradient-to-br ${node.color} shadow-2xl backdrop-blur-md border border-white/20`}
                                style={{ width: node.size, height: node.size }}
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                {/* Inner Glow */}
                                <div className="absolute inset-2 rounded-full bg-black/20 mix-blend-overlay" />

                                <span className="relative z-10 font-bold text-white text-center px-2 text-sm md:text-base drop-shadow-md">
                                    {node.label}
                                </span>

                                {/* Hover Ring */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1.3 }}
                                            exit={{ opacity: 0, scale: 1 }}
                                            className={`absolute inset-0 rounded-full border-2 border-white/30 border-dashed animate-[spin_10s_linear_infinite]`}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                            className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl pointer-events-none"
                                        >
                                            <div className="flex flex-col gap-1 items-center">
                                                <span className="text-xs text-white/60">Affinity Score</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${node.color}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${node.affinity}%` }}
                                                            transition={{ duration: 0.5, delay: 0.1 }}
                                                        />
                                                    </div>
                                                    <span className="font-mono text-sm font-bold text-white">{node.affinity}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </GlassCard>
        </section>
    );
}
