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

// A curated library of tracks to recommend from
const TRACK_LIBRARY: Track[] = [
    // === Morning / Upbeat ===
    { id: 't1', title: 'Golden Hour', artist: 'JVKE', genre: 'Pop', mood: 'Happy', energy: 0.65, valence: 0.8, tempo: 110, cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop', tags: ['upbeat', 'feel-good'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 't1', title: 'Golden Hour', artist: 'JVKE', genre: 'Pop', mood: 'Dreamy', energy: 0.4, valence: 0.6, tempo: 94, cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4b/39/1a/4b391a33-6627-2c9c-5011-39659468926a/196362095818.jpg/600x600bb.jpg', tags: ['piano', 'dreamy'], bestTimeOfDay: ['evening', 'afternoon'], locationVibes: ['cozy', 'nature'], url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/4b/8d/f3/4b8df32f-7634-118f-3da2-61f26569107a/mzaf_15783515024769062334.plus.aac.p.m4a' },
    { id: 't2', title: 'Starboy', artist: 'The Weeknd', genre: 'R&B', mood: 'Energetic', energy: 0.8, valence: 0.5, tempo: 186, cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/09/cc/62/09cc626c-9469-6547-810a-6f4e650f9f30/16UMGIM69455.rgb.jpg/600x600bb.jpg', tags: ['synth', 'dark'], bestTimeOfDay: ['night', 'evening'], locationVibes: ['urban', 'commute'], url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/d5/9c/e2/d59ce26a-99d7-8321-729d-40507a689456/mzaf_10547029513076840787.plus.aac.p.m4a' },
    { id: 't3', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Synthpop', mood: 'Happy', energy: 0.85, valence: 0.7, tempo: 171, cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/6b/df/12/6bdf1272-8d76-02e0-2646-cd7c89f5bc3a/20UMGIM08207.rgb.jpg/600x600bb.jpg', tags: ['80s', 'retro'], bestTimeOfDay: ['night', 'morning'], locationVibes: ['urban', 'commute'], url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/65/57/54/65575453-2475-4927-9c9c-0720272b1fe3/mzaf_10444641695782782163.plus.aac.p.m4a' },
    { id: 't4', title: 'Electric Feel', artist: 'MGMT', genre: 'Indie', mood: 'Happy', energy: 0.7, valence: 0.8, tempo: 120, cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=200&h=200&fit=crop', tags: ['indie', 'feel-good'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['beach', 'urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 't5', title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'Pop Rock', mood: 'Happy', energy: 0.9, valence: 0.95, tempo: 132, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop', tags: ['classic', 'upbeat'], bestTimeOfDay: ['morning'], locationVibes: ['commute', 'urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },

    // === Afternoon / Focus ===
    { id: 't6', title: 'Flow State', artist: 'Deep Neural', genre: 'Electronic', mood: 'Focused', energy: 0.5, valence: 0.5, tempo: 100, cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop', tags: ['focus', 'ambient'], bestTimeOfDay: ['afternoon'], locationVibes: ['cozy', 'urban'] },
    { id: 't7', title: 'Digital Rain', artist: 'Tycho', genre: 'Electronic', mood: 'Calm', energy: 0.35, valence: 0.55, tempo: 85, cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop', tags: ['ambient', 'focus'], bestTimeOfDay: ['afternoon', 'evening'], locationVibes: ['cozy', 'mountains'] },
    { id: 't8', title: 'Async Dreams', artist: 'Bonobo', genre: 'Electronic', mood: 'Calm', energy: 0.4, valence: 0.6, tempo: 90, cover: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?w=200&h=200&fit=crop', tags: ['downtempo', 'focus'], bestTimeOfDay: ['afternoon'], locationVibes: ['cozy', 'mountains'] },
    { id: 't9', title: 'Weightless', artist: 'Marconi Union', genre: 'Ambient', mood: 'Calm', energy: 0.2, valence: 0.4, tempo: 60, cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', tags: ['ambient', 'relax'], bestTimeOfDay: ['afternoon'], locationVibes: ['cozy'] },
    { id: 't10', title: 'Daylight', artist: 'Joji', genre: 'R&B', mood: 'Melancholic', energy: 0.45, valence: 0.4, tempo: 92, cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', tags: ['r&b', 'emotional'], bestTimeOfDay: ['afternoon', 'evening'], locationVibes: ['urban', 'commute'] },

    // === Evening / Chill ===
    { id: 't11', title: 'Midnight City', artist: 'M83', genre: 'Synthwave', mood: 'Energetic', energy: 0.75, valence: 0.7, tempo: 105, cover: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&h=200&fit=crop', tags: ['synthwave', 'night'], bestTimeOfDay: ['evening', 'night'], locationVibes: ['urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 't12', title: 'After Dark', artist: 'Mr.Kitty', genre: 'Synthpop', mood: 'Melancholic', energy: 0.6, valence: 0.45, tempo: 100, cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop', tags: ['synthpop', 'dark'], bestTimeOfDay: ['evening', 'night'], locationVibes: ['urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id: 't13', title: 'Sunset Lover', artist: 'Petit Biscuit', genre: 'Electronic', mood: 'Calm', energy: 0.45, valence: 0.65, tempo: 88, cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop', tags: ['chill', 'sunset'], bestTimeOfDay: ['evening'], locationVibes: ['beach', 'mountains'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    { id: 't14', title: 'Dusk Till Dawn', artist: 'ZAYN', genre: 'Pop', mood: 'Romantic', energy: 0.55, valence: 0.6, tempo: 96, cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop', tags: ['pop', 'romantic'], bestTimeOfDay: ['evening'], locationVibes: ['cozy', 'urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
    { id: 't15', title: 'Neon Lights', artist: 'The Midnight', genre: 'Synthwave', mood: 'Nostalgic', energy: 0.65, valence: 0.7, tempo: 108, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop', tags: ['synthwave', 'retro'], bestTimeOfDay: ['evening', 'night'], locationVibes: ['urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },

    // === Night / Deep ===
    { id: 't16', title: 'Nightcall', artist: 'Kavinsky', genre: 'Synthwave', mood: 'Dark', energy: 0.7, valence: 0.4, tempo: 96, cover: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&h=200&fit=crop', tags: ['synthwave', 'drive'], bestTimeOfDay: ['night', 'lateNight'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
    { id: 't17', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Synthpop', mood: 'Energetic', energy: 0.8, valence: 0.75, tempo: 171, cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=200&h=200&fit=crop', tags: ['pop', 'synth'], bestTimeOfDay: ['night'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
    { id: 't18', title: 'Resonance', artist: 'HOME', genre: 'Synthwave', mood: 'Nostalgic', energy: 0.55, valence: 0.6, tempo: 100, cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop', tags: ['vaporwave', 'dreamy'], bestTimeOfDay: ['night', 'lateNight'], locationVibes: ['cozy', 'urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
    { id: 't19', title: 'Sleepwalking', artist: 'The Chain Gang of 1974', genre: 'Indie', mood: 'Dreamy', energy: 0.6, valence: 0.5, tempo: 104, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop', tags: ['indie', 'night'], bestTimeOfDay: ['night'], locationVibes: ['urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' },
    { id: 't20', title: 'Dark Paradise', artist: 'Lana Del Rey', genre: 'Indie Pop', mood: 'Melancholic', energy: 0.4, valence: 0.3, tempo: 80, cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop', tags: ['melancholic', 'cinematic'], bestTimeOfDay: ['night', 'lateNight'], locationVibes: ['cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },

    // === Late Night / Ambient ===
    { id: 't21', title: 'Intro', artist: 'The xx', genre: 'Indie', mood: 'Calm', energy: 0.3, valence: 0.5, tempo: 60, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', tags: ['minimal', 'night'], bestTimeOfDay: ['lateNight', 'night'], locationVibes: ['cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 't22', title: '3AM Thoughts', artist: 'Nujabes', genre: 'Lo-Fi', mood: 'Reflective', energy: 0.3, valence: 0.4, tempo: 75, cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', tags: ['lofi', 'jazzy'], bestTimeOfDay: ['lateNight'], locationVibes: ['cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 't23', title: 'Lucid Dreams', artist: 'Tame Impala', genre: 'Psychedelic', mood: 'Dreamy', energy: 0.5, valence: 0.55, tempo: 95, cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop', tags: ['psychedelic', 'dreamy'], bestTimeOfDay: ['lateNight', 'night'], locationVibes: ['cozy', 'mountains'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 't24', title: 'Moonlight Sonata', artist: 'Beethoven', genre: 'Classical', mood: 'Peaceful', energy: 0.15, valence: 0.35, tempo: 55, cover: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?w=200&h=200&fit=crop', tags: ['classical', 'peaceful'], bestTimeOfDay: ['lateNight'], locationVibes: ['cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 't25', title: 'Northern Lights', artist: 'Ólafur Arnalds', genre: 'Neoclassical', mood: 'Peaceful', energy: 0.2, valence: 0.5, tempo: 70, cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop', tags: ['neoclassical', 'ambient'], bestTimeOfDay: ['lateNight'], locationVibes: ['mountains', 'cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },

    // === Workout / High Energy ===
    { id: 't26', title: 'Lose Yourself', artist: 'Eminem', genre: 'Hip Hop', mood: 'Energetic', energy: 0.95, valence: 0.6, tempo: 170, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop', tags: ['hiphop', 'motivation'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 't27', title: 'Thunderstruck', artist: 'AC/DC', genre: 'Rock', mood: 'Energetic', energy: 0.95, valence: 0.85, tempo: 134, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop', tags: ['rock', 'classic'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 't28', title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', mood: 'Happy', energy: 0.85, valence: 0.9, tempo: 103, cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=200&h=200&fit=crop', tags: ['pop', 'dance'], bestTimeOfDay: ['morning', 'afternoon', 'evening'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },

    // === Rainy Day / Cozy ===
    { id: 't29', title: 'Skinny Love', artist: 'Bon Iver', genre: 'Indie Folk', mood: 'Melancholic', energy: 0.3, valence: 0.3, tempo: 75, cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop', tags: ['folk', 'emotional'], bestTimeOfDay: ['afternoon', 'evening'], locationVibes: ['cozy', 'mountains'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 't30', title: 'Holocene', artist: 'Bon Iver', genre: 'Indie Folk', mood: 'Reflective', energy: 0.35, valence: 0.4, tempo: 80, cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop', tags: ['folk', 'introspective'], bestTimeOfDay: ['afternoon', 'evening'], locationVibes: ['mountains', 'cozy'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },

    // === Beach / Chill ===
    { id: 't31', title: 'Island in the Sun', artist: 'Weezer', genre: 'Rock', mood: 'Happy', energy: 0.6, valence: 0.85, tempo: 118, cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop', tags: ['rock', 'summer'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['beach'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    { id: 't32', title: 'Summertime Magic', artist: 'Childish Gambino', genre: 'R&B', mood: 'Happy', energy: 0.55, valence: 0.8, tempo: 96, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', tags: ['r&b', 'summer'], bestTimeOfDay: ['afternoon', 'evening'], locationVibes: ['beach', 'urban'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },

    // === Road Trip ===
    { id: 't33', title: 'Shut Up and Drive', artist: 'Rihanna', genre: 'Pop', mood: 'Energetic', energy: 0.85, valence: 0.8, tempo: 130, cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop', tags: ['pop', 'drive'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
    { id: 't34', title: 'Life is a Highway', artist: 'Tom Cochrane', genre: 'Rock', mood: 'Happy', energy: 0.8, valence: 0.9, tempo: 124, cover: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&h=200&fit=crop', tags: ['rock', 'road'], bestTimeOfDay: ['morning', 'afternoon'], locationVibes: ['commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
    { id: 't35', title: 'Starboy', artist: 'The Weeknd', genre: 'Synthpop', mood: 'Dark', energy: 0.75, valence: 0.55, tempo: 186, cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', tags: ['synth', 'dark'], bestTimeOfDay: ['night', 'evening'], locationVibes: ['urban', 'commute'], url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
];

// ============================================================
// Recommendation Engine
// ============================================================

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
export function getTimeBasedRecommendations(): { title: string; subtitle: string; tracks: Track[] } {
    const tod = getCurrentTimeOfDay();
    const labels: Record<string, { title: string; subtitle: string }> = {
        morning: { title: 'Morning Energy', subtitle: 'Start your day with these uplifting tracks' },
        afternoon: { title: 'Afternoon Flow', subtitle: 'Stay focused and productive' },
        evening: { title: 'Evening Unwind', subtitle: 'Wind down with the perfect soundtrack' },
        night: { title: 'Night Drive', subtitle: 'Music for the night owls' },
        lateNight: { title: 'Late Night Sessions', subtitle: 'Deep sounds for the quiet hours' },
    };

    const tracks = shuffle(TRACK_LIBRARY.filter(t => t.bestTimeOfDay.includes(tod))).slice(0, 8);
    return { ...labels[tod], tracks };
}

// Get tracks matching the user's detected/set location vibe
export function getLocationBasedRecommendations(locationVibe: string): { title: string; subtitle: string; tracks: Track[] } {
    const vibeLabels: Record<string, { title: string; subtitle: string }> = {
        urban: { title: 'City Pulse', subtitle: 'The soundtrack of the streets' },
        beach: { title: 'Coastal Waves', subtitle: 'Beachy vibes for sandy toes' },
        mountains: { title: 'Mountain Echoes', subtitle: 'Sounds from the peaks' },
        cozy: { title: 'Cozy Corner', subtitle: 'Perfect for your chill spot' },
        commute: { title: 'Commute Boost', subtitle: 'Make your journey unforgettable' },
    };

    const tracks = shuffle(TRACK_LIBRARY.filter(t => t.locationVibes.includes(locationVibe))).slice(0, 8);
    const label = vibeLabels[locationVibe] || { title: 'For You', subtitle: 'Based on your location' };
    return { ...label, tracks };
}

// Personalized recommendations based on listening history
export function getPersonalizedRecommendations(user: User): { title: string; subtitle: string; tracks: Track[] } {
    const history = user.listeningHistory;

    if (history.length === 0) {
        // No history — return popular/trending
        return {
            title: 'Trending Now',
            subtitle: 'Popular picks to get you started',
            tracks: shuffle(TRACK_LIBRARY).slice(0, 8),
        };
    }

    // Analyze preferences from history
    const genreCount: Record<string, number> = {};
    const moodCount: Record<string, number> = {};
    let avgEnergy = 0;
    let avgValence = 0;

    history.forEach(e => {
        genreCount[e.genre] = (genreCount[e.genre] || 0) + 1;
        moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
        avgEnergy += e.energy;
        avgValence += e.valence;
    });

    avgEnergy /= history.length;
    avgValence /= history.length;

    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const topMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

    // Score each track
    const scored = TRACK_LIBRARY.map(track => {
        let score = 0;
        if (topGenres.includes(track.genre)) score += 3;
        if (topMoods.includes(track.mood)) score += 2;
        // Prefer tracks with similar energy/valence
        score -= Math.abs(track.energy - avgEnergy) * 2;
        score -= Math.abs(track.valence - avgValence) * 2;
        // Bonus for matching current time
        if (track.bestTimeOfDay.includes(getCurrentTimeOfDay())) score += 1;
        return { track, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Remove tracks already in recent history
    const recentTracks = new Set(history.slice(-20).map(e => e.trackTitle));
    const filtered = scored.filter(s => !recentTracks.has(s.track.title));

    return {
        title: 'Made For You',
        subtitle: `Based on your love for ${topGenres[0] || 'music'}`,
        tracks: filtered.slice(0, 8).map(s => s.track),
    };
}

// Time-and-history hybrid: what you usually listen to at this time
export function getTimePatternRecommendations(user: User): { title: string; subtitle: string; tracks: Track[] } | null {
    const currentTod = getCurrentTimeOfDay();
    const historyForTime = user.listeningHistory.filter(e => e.timeOfDay === currentTod);

    if (historyForTime.length < 3) return null;

    const genreCount: Record<string, number> = {};
    const moodCount: Record<string, number> = {};

    historyForTime.forEach(e => {
        genreCount[e.genre] = (genreCount[e.genre] || 0) + 1;
        moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
    });

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const tracks = shuffle(
        TRACK_LIBRARY.filter(t =>
            t.bestTimeOfDay.includes(currentTod) &&
            (t.genre === topGenre || t.mood === topMood)
        )
    ).slice(0, 8);

    if (tracks.length < 3) return null;

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
        tracks,
    };
}

// ============================================================
// iTunes Music API Integration
// ============================================================

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
            mood: 'Unknown', // iTunes doesn't provide mood, we can infer if needed
            energy: 0.5,
            valence: 0.5,
            tempo: 100,
            cover: item.artworkUrl100.replace('100x100bb', '600x600bb'), // High-res artwork
            tags: [item.primaryGenreName.toLowerCase()],
            bestTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
            locationVibes: ['urban'],
            url: item.previewUrl
        }));
    } catch (error) {
        console.error("iTunes API fetch failed:", error);
        // Fallback to local search if API fails
        return TRACK_LIBRARY.filter(t => 
            t.title.toLowerCase().includes(query.toLowerCase()) || 
            t.artist.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Legacy search for compatibility (now using the API)
export function searchMassiveLibrary(query: string): Track[] {
    // This is now handled asynchronously in the UI via searchMusicAPI
    return TRACK_LIBRARY.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) || 
        t.artist.toLowerCase().includes(query.toLowerCase())
    );
}

export function getRecommendedSections() {
    return [
        {
            title: "Trending in Your Area",
            items: TRACK_LIBRARY.filter(t => t.energy > 0.6).slice(0, 8)
        },
        {
            title: "Made For You",
            items: TRACK_LIBRARY.filter(t => t.valence > 0.6).slice(0, 8)
        },
        {
            title: "Focus & Flow",
            items: TRACK_LIBRARY.filter(t => t.mood === 'Focused' || t.genre === 'Ambient').slice(0, 8)
        }
    ];
}

// Get all recommendation sections for the home page
export function getAllRecommendations(user: User | null, locationVibe: string): {
    timeBased: ReturnType<typeof getTimeBasedRecommendations>;
    locationBased: ReturnType<typeof getLocationBasedRecommendations>;
    personalized: ReturnType<typeof getPersonalizedRecommendations> | null;
    timePattern: ReturnType<typeof getTimePatternRecommendations>;
} {
    const timeBased = getTimeBasedRecommendations();
    const locationBased = getLocationBasedRecommendations(locationVibe);
    const personalized = user ? getPersonalizedRecommendations(user) : null;
    const timePattern = user ? getTimePatternRecommendations(user) : null;

    return { timeBased, locationBased, personalized, timePattern };
}

export { TRACK_LIBRARY };
