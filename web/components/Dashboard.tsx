"use client";


import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { Activity, Flame, Headphones, Target } from "lucide-react";

export function Dashboard() {
    const stats = [
        { label: "Listening Time", value: "142h", change: "+12%", icon: Headphones, color: "text-blue-400" },
        { label: "New Artists", value: "47", change: "+8", icon: Target, color: "text-purple-400" },
        { label: "Top Genre", value: "Synthwave", change: "98% Match", icon: Flame, color: "text-pink-400" },
        { label: "AI Conf. Score", value: "9.8/10", change: "+0.2", icon: Activity, color: "text-emerald-400" },
    ];

    return (
        <section className="w-full flex flex-col gap-8 py-10 px-4 md:px-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Your AI Soundscape Dashboard</h2>
                <p className="text-white/60 text-lg">Insights generated from your listening vectors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                        <GlassCard className="p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-white/50 bg-white/5 px-2 py-1 rounded-full">{stat.change}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold">{stat.value}</span>
                                <span className="text-sm text-white/60">{stat.label}</span>
                            </div>

                            {/* Mini Chart Mock */}
                            <div className="flex items-end gap-1 h-8 mt-2 opacity-50">
                                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-white/5 to-white/40 rounded-t-sm"
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.05), type: "spring" }}
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <GlassCard className="h-full min-h-[400px] p-6 flex flex-col glowOnHover={false}">
                        <h3 className="text-xl font-bold mb-6">Weekly Taste Evolution</h3>
                        <div className="flex-1 relative w-full flex items-end justify-between px-4 pb-4 border-b border-white/10">
                            {/* Mock Line Chart */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <motion.path
                                    d="M 0 80 Q 20 60 40 40 T 80 20 T 100 10"
                                    stroke="url(#chart-grad)" strokeWidth="2" fill="none"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                />
                                <defs>
                                    <linearGradient id="chart-grad"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
                                </defs>
                            </svg>
                            {/* Data Points */}
                            {[0, 20, 40, 60, 80, 100].map((x) => (
                                <div key={x} className="flex flex-col items-center gap-2 z-10" style={{ left: `${x}%`, position: x !== 0 && x !== 100 ? 'absolute' : 'relative' }}>
                                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                                    <span className="text-xs text-white/40 absolute top-4">Mon</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <GlassCard className="h-full min-h-[400px] p-6 flex flex-col gap-6">
                        <h3 className="text-xl font-bold">Recently Discovered</h3>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=100&h=100&auto=format&fit=crop`} alt="Artist" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-medium text-white/90 group-hover:text-pink-400 transition-colors">Neural Artist {i}</span>
                                        <span className="text-xs text-white/40">Discovered 2d ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-auto py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/5">
                            View All Discoveries
                        </button>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}
