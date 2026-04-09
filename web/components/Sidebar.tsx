"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Compass,
    Radio,
    Library,
    PlusSquare,
    Heart,
    Settings,
    LogOut,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Discover", href: "/discover" },
    { icon: Radio, label: "Mood Station", href: "/mood" },
    { icon: Library, label: "Your Library", href: "/library" },
];

const playlistItems = [
    { icon: PlusSquare, label: "Create Playlist", href: "/create" },
    { icon: Heart, label: "Liked Songs", href: "/liked" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="w-64 h-full flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/5 p-6 gap-8">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/90">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                    RESONANCE
                </span>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                <nav className="flex flex-col gap-2">
                    <p className="px-2 text-xs font-semibold text-white/40 tracking-wider mb-2">MENU</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.label} href={item.href}>
                                <motion.div
                                    className={cn(
                                        "flex items-center gap-4 px-2 py-2.5 rounded-lg transition-colors group relative",
                                        isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    )}
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <nav className="flex flex-col gap-2">
                    <p className="px-2 text-xs font-semibold text-white/40 tracking-wider mb-2">LIBRARY</p>
                    {playlistItems.map((item) => (
                        <Link key={item.label} href={item.href}>
                            <motion.div
                                className="flex items-center gap-4 px-2 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* User Profile Section */}
            <div className="mt-auto flex flex-col gap-3">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {user && (
                    <div className="relative">
                        <motion.div
                            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                            onClick={() => setShowMenu(!showMenu)}
                            whileHover={{ x: 4 }}
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 border border-white/10 flex items-center justify-center p-[2px] shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                                <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                    <User className="w-4 h-4 text-white/90" />
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium text-sm text-white/90 truncate">{user.name}</span>
                                <span className="text-xs text-white/40 truncate">{user.email}</span>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full left-2 right-2 mb-2 p-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"
                                >
                                    <button
                                        onClick={() => { setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => { logout(); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
