"use client";

import { HeroSection } from "@/components/HeroSection";
import { ContextualRecommendations } from "@/components/ContextualRecommendations";
import { TasteMap } from "@/components/TasteMap";
import { MoodDiscovery } from "@/components/MoodDiscovery";
import { Dashboard } from "@/components/Dashboard";
import { PlaylistBuilder } from "@/components/PlaylistBuilder";

export default function Home() {
    return (
        <main className="w-full max-w-7xl mx-auto flex flex-col relative z-10 gap-16">
            <HeroSection />

            <ContextualRecommendations />

            <TasteMap />

            <MoodDiscovery />

            <Dashboard />

            <PlaylistBuilder />

            <div className="h-48" />
        </main>
    );
}
