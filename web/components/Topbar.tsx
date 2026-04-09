"use client";

import { Bell, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartSearch } from "./SmartSearch";
import { useAuth } from "@/lib/AuthContext";
import { useState, useRef, useEffect } from "react";

export function Topbar() {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-20 w-full flex items-center justify-between px-8 bg-transparent pointer-events-none sticky top-0 z-40">
            <div className="flex-1 max-w-xl pointer-events-auto relative">
                <SmartSearch />
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
                <motion.button
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500" />
                </motion.button>

                <div className="relative" ref={menuRef}>
                    <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 border-2 border-white/10 flex items-center justify-center p-[2px] cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                            {user ? (
                                <span className="text-sm font-bold text-white/90">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <User className="w-5 h-5 text-white/90" />
                            )}
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {showMenu && user && (
                            <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl"
                            >
                                <div className="px-3 py-3 border-b border-white/5 mb-2">
                                    <p className="font-semibold text-sm text-white">{user.name}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
                                    {user.preferences.favoriteGenres.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {user.preferences.favoriteGenres.slice(0, 4).map(g => (
                                                <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => { logout(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
