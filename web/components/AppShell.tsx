"use client";

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { MusicPlayer } from '@/components/MusicPlayer';
import { useAuth } from '@/lib/AuthContext';

const AUTH_ROUTES = ['/login', '/signup'];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading: authLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !authLoading) {
            if (!user && !isAuthRoute) {
                router.push('/login');
            }
            if (user && isAuthRoute) {
                router.push('/');
            }
        }
    }, [user, authLoading, isAuthRoute, router, isMounted]);

    // Initial server render or hydration phase
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-background">
                <AnimatedBackground />
                <div className="fixed inset-0 z-[1] bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            </div>
        );
    }

    // Auth pages — render clean, no sidebar
    if (isAuthRoute) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <AnimatedBackground />
                <div className="fixed inset-0 z-[1] bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
                <main className="relative z-10">
                    {children}
                </main>
            </div>
        );
    }

    // Loading state or redirecting
    if (authLoading || (!user && !isAuthRoute)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <AnimatedBackground />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/90">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-white/50 text-sm font-medium tracking-wide">Initializing Resonance...</p>
                </div>
            </div>
        );
    }

    // Final app shell for authenticated users
    return (
        <div className="flex overflow-hidden min-h-screen bg-background selection:bg-purple-500/30">
            <AnimatedBackground />
            <div className="fixed inset-0 z-[1] bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <aside className="z-20 h-screen sticky top-0 shrink-0">
                <Sidebar />
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 custom-scrollbar">
                <Topbar />
                <div className="px-8 pb-32 pt-4">
                    {children}
                </div>
            </main>
            <MusicPlayer />
        </div>
    );
}
