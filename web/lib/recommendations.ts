import { ListeningEntry, User } from './auth';

// ============================================================
// Track Data Model & Curated Library
// ============================================================

export interface Track {
    id: string;
    title: string;
    artist: string;
    genre: string;
    mood: string;
    energy: number;      // 0-1
    valence: number;      // 0-1 (happiness)
    tempo: number;
    cover: string;
    tags: string[];
    bestTimeOfDay: string[];
    locationVibes: string[];  // e.g., "urban", "beach", "mountains", "cozy", "commute"
    url?: string;
}

// All music is now fetched dynamically from the iTunes API.
// No hardcoded library exists anymore.

function getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 || hour < 1) return 'night';
    return 'lateNight';
}

function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Get tracks matching the current time of day
export async function getTimeBasedRecommendations(): Promise<{ title: string; subtitle: string; tracks: Track[] }> {
    const tod = getCurrentTimeOfDay();
    const labels: Record<string, { title: string; subtitle: string; query: string }> = {
        morning: { title: 'Morning Energy', subtitle: 'Start your day with these uplifting tracks', query: 'morning pop hits' },
        afternoon: { title: 'Afternoon Flow', subtitle: 'Stay focused and productive', query: 'lofi hip hop study' },
        evening: { title: 'Evening Unwind', subtitle: 'Wind down with the perfect soundtrack', query: 'acoustic chill' },
        night: { title: 'Night Drive', subtitle: 'Music for the night owls', query: 'synthwave drive' },
        lateNight: { title: 'Late Night Sessions', subtitle: 'Deep sounds for the quiet hours', query: 'deep house ambient' },
    };

    const config = labels[tod];
    const tracks = await searchMusicAPI(config.query);
    return { ...config, tracks: tracks.slice(0, 8) };
}

// Get tracks matching the user's detected/set location vibe
export async function getLocationBasedRecommendations(locationVibe: string): Promise<{ title: string; subtitle: string; tracks: Track[] }> {
    const vibeLabels: Record<string, { title: string; subtitle: string; query: string }> = {
        urban: { title: 'City Pulse', subtitle: 'The soundtrack of the streets', query: 'modern hip hop' },
        beach: { title: 'Coastal Waves', subtitle: 'Beachy vibes for sandy toes', query: 'tropical house summer' },
        mountains: { title: 'Mountain Echoes', subtitle: 'Sounds from the peaks', query: 'indie folk mountain' },
        cozy: { title: 'Cozy Corner', subtitle: 'Perfect for your chill spot', query: 'cozy jazz piano' },
        commute: { title: 'Commute Boost', subtitle: 'Make your journey unforgettable', query: 'driving rock anthem' },
    };

    const config = vibeLabels[locationVibe] || { title: 'For You', subtitle: 'Based on your location', query: 'top hits' };
    const tracks = await searchMusicAPI(config.query);
    return { ...config, tracks: tracks.slice(0, 8) };
}

// Personalized recommendations based on listening history
export async function getPersonalizedRecommendations(user: User): Promise<{ title: string; subtitle: string; tracks: Track[] }> {
    const history = user.listeningHistory || [];

    if (history.length === 0) {
        const tracks = await searchMusicAPI("top hits 2024");
        return {
            title: 'Trending Now',
            subtitle: 'Popular picks to get you started',
            tracks: tracks.slice(0, 8),
        };
    }

    const genreCount: Record<string, number> = {};
    history.forEach(e => {
        genreCount[e.genre] = (genreCount[e.genre] || 0) + 1;
    });

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'pop';
    const tracks = await searchMusicAPI(topGenre);

    return {
        title: 'Made For You',
        subtitle: `Based on your love for ${topGenre}`,
        tracks: tracks.slice(0, 8),
    };
}

// Time-and-history hybrid: what you usually listen to at this time
export async function getTimePatternRecommendations(user: User): Promise<{ title: string; subtitle: string; tracks: Track[] } | null> {
    const currentTod = getCurrentTimeOfDay();
    const historyForTime = (user.listeningHistory || []).filter(e => e.timeOfDay === currentTod);

    if (historyForTime.length < 2) return null;

    const genreCount: Record<string, number> = {};
    historyForTime.forEach(e => {
        genreCount[e.genre] = (genreCount[e.genre] || 0) + 1;
    });

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'chill';
    const tracks = await searchMusicAPI(`${topGenre} chill`);

    const labels: Record<string, string> = {
        morning: 'Your Morning Ritual',
        afternoon: 'Your Afternoon Groove',
        evening: 'Your Evening Essentials',
        night: 'Your Night Staples',
        lateNight: 'Your Late Night Favourites',
    };

    return {
        title: labels[currentTod] || 'Your Pattern',
        subtitle: `You usually play ${topGenre} around this time`,
        tracks: tracks.slice(0, 8),
    };
}

// ============================================================
// Enhanced iTunes API Fetchers
// ============================================================

export async function getTracksByMood(mood: string, limit = 10): Promise<Track[]> {
    const moodQueryMap: Record<string, string> = {
        focus: "lo-fi study beats",
        gym: "workout hits 2024",
        chill: "chill lofi hip hop",
        drive: "synthwave night drive",
        uplift: "happy pop hits",
        happy: "happy vibes",
        calm: "ambient relaxation",
        energetic: "high energy dance",
    };

    const term = moodQueryMap[mood.toLowerCase()] || mood;
    const tracks = await searchMusicAPI(term);
    return tracks.slice(0, limit);
}

export async function getTrendingTracks(limit = 10): Promise<Track[]> {
    const tracks = await searchMusicAPI("top hits 2024");
    return tracks.slice(0, limit);
}

export async function searchMusicAPI(query: string): Promise<Track[]> {
    const q = encodeURIComponent(query.toLowerCase().trim());
    if (!q) return [];

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=50`);
        const data = await response.json();
        
        if (!data.results) return [];

        return data.results.map((item: any) => ({
            id: `itunes-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            genre: item.primaryGenreName,
            mood: 'Deeply Moving', 
            energy: 0.5,
            valence: 0.5,
            tempo: 100,
            cover: item.artworkUrl100.replace('100x100bb', '600x600bb'),
            tags: [item.primaryGenreName.toLowerCase()],
            bestTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
            locationVibes: ['urban'],
            url: item.previewUrl
        }));
    } catch (error) {
        console.error("iTunes API fetch failed:", error);
        return [];
    }
}

// Legacy search for compatibility
export async function searchMassiveLibrary(query: string): Promise<Track[]> {
    return searchMusicAPI(query);
}

export async function getRecommendedSections(): Promise<{ title: string; items: Track[] }[]> {
    const results = await searchMusicAPI("top hits 2024");
    return [
        {
            title: "Trending in Your Area",
            items: results.slice(0, 8)
        },
        {
            title: "Made For You",
            items: results.slice(8, 16)
        },
        {
            title: "Focus & Flow",
            items: results.slice(16, 24)
        }
    ];
}

// Get all recommendation sections for the home page
export async function getAllRecommendations(user: User | null, locationVibe: string): Promise<{
    timeBased: Awaited<ReturnType<typeof getTimeBasedRecommendations>>;
    locationBased: Awaited<ReturnType<typeof getLocationBasedRecommendations>>;
    personalized: Awaited<ReturnType<typeof getPersonalizedRecommendations>> | null;
    timePattern: Awaited<ReturnType<typeof getTimePatternRecommendations>>;
}> {
    const [timeBased, locationBased] = await Promise.all([
        getTimeBasedRecommendations(),
        getLocationBasedRecommendations(locationVibe)
    ]);

    const personalized = user ? await getPersonalizedRecommendations(user) : null;
    const timePattern = user ? await getTimePatternRecommendations(user) : null;

    return { timeBased, locationBased, personalized, timePattern };
}
