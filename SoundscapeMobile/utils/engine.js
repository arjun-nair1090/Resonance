// ============================================================
// SoundScape Mobile — Data Processing Engine
// Ported from script.js
// ============================================================

export function parseCSV(text) {
    const lines = text.split('\n');
    if (lines.length < 2) return [];

    // Skip headers (lines[0])
    const songs = [];
    let id = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length < 10) continue;

        const trackName = cleanQuotes(values[0]);
        const artistName = cleanQuotes(values[1]);
        const genre = cleanQuotes(values[3]) || '';
        const danceability = parseFloat(values[4]);
        const energy = parseFloat(values[5]);
        const loudness = parseFloat(values[7]);
        const speechiness = parseFloat(values[9]);
        const acousticness = parseFloat(values[10]);
        const instrumentalness = parseFloat(values[11]);
        const liveness = parseFloat(values[12]);
        const valence = parseFloat(values[13]);
        const tempo = parseFloat(values[14]);
        const durationMs = parseFloat(values[20]);
        const spotifyId = cleanQuotes(values[16]);

        // Skip songs with missing critical data
        if (!trackName || isNaN(energy) || isNaN(valence) || isNaN(danceability)) continue;

        const mood = deriveMood(valence, energy, danceability, acousticness, instrumentalness);
        const energyLevel = Math.min(5, Math.max(1, Math.round(energy * 5)));
        const vibeCategory = deriveVibe(valence, energy, danceability, tempo);

        songs.push({
            id: id++,
            title: trackName,
            artist: artistName,
            genre: genre,
            mood: mood,
            vibe: vibeCategory,
            energy: energyLevel,
            energyRaw: energy,
            danceability: danceability,
            valence: valence,
            acousticness: acousticness || 0,
            instrumentalness: instrumentalness || 0,
            speechiness: speechiness || 0,
            liveness: liveness || 0,
            tempo: tempo || 120,
            loudness: loudness || -10,
            durationMs: durationMs || 0,
            spotifyId: spotifyId,
            reason: generateReason(mood, energy, valence, danceability, genre, tempo)
        });
    }

    return deduplicateSongs(songs);
}

export function deduplicateSongs(songs) {
    const seen = new Set();
    const unique = [];
    for (const song of songs) {
        // Prefer dedup by Spotify track ID, fallback to title+artist
        const key = song.spotifyId
            ? song.spotifyId
            : (song.title.toLowerCase() + '|||' + song.artist.toLowerCase());
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(song);
        }
    }
    // Re-assign sequential IDs
    unique.forEach((s, i) => s.id = i);
    return unique;
}

export function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

export function cleanQuotes(str) {
    if (!str) return '';
    return str.replace(/^"+|"+$/g, '').trim();
}

// ===== MOOD DERIVATION =====
export function deriveMood(valence, energy, danceability, acousticness, instrumentalness) {
    if (valence > 0.6 && energy > 0.6) return 'Happy';
    if (energy > 0.7 && danceability > 0.65) return 'Energetic';
    if (valence < 0.3 && energy < 0.4) return 'Melancholy';
    if (acousticness > 0.7 && energy < 0.4) return 'Relaxed';
    if (instrumentalness > 0.5 && energy < 0.5) return 'Focus';
    if (valence > 0.5 && danceability > 0.6) return 'Happy';
    if (energy > 0.6) return 'Energetic';
    if (valence < 0.4 && energy < 0.55) return 'Melancholy';
    if (acousticness > 0.5 || instrumentalness > 0.3) return 'Relaxed';
    if (valence > 0.4 && valence < 0.6 && danceability > 0.55) return 'Romantic';
    return 'Focus';
}

export function deriveVibe(valence, energy, danceability, tempo) {
    if (energy > 0.8 && tempo > 140) return 'Party';
    if (energy > 0.7 && danceability > 0.7) return 'Dance';
    if (valence > 0.7 && energy > 0.5) return 'Feel Good';
    if (energy < 0.3 && valence < 0.4) return 'Late Night';
    if (energy < 0.4 && valence < 0.5) return 'Chill';
    if (danceability > 0.7) return 'Groovy';
    return 'Vibe';
}

// ===== REASON GENERATION =====
export function generateReason(mood, energy, valence, danceability, genre, tempo) {
    const reasons = {
        Happy: [
            `A feel-good ${genre || 'track'} with high positivity (${(valence * 100).toFixed(0)}%) — guaranteed to lift your spirits.`,
            `Upbeat and joyful with ${(danceability * 100).toFixed(0)}% danceability — perfect for happy moments.`,
            `This bright ${genre || 'song'} radiates pure positivity and good vibes.`
        ],
        Energetic: [
            `High-energy ${genre || 'banger'} at ${tempo?.toFixed(0) || 120} BPM — perfect for workouts or getting pumped.`,
            `An explosive ${genre || 'track'} with ${(energy * 100).toFixed(0)}% energy to fuel your adrenaline.`,
            `Fast-paced and powerful — this ${genre || 'song'} won't let you sit still.`
        ],
        Melancholy: [
            `A deeply emotional ${genre || 'track'} with a low positivity score — for reflective moments.`,
            `Somber and introspective ${genre || 'piece'} that resonates with melancholic moods.`,
            `This hauntingly beautiful ${genre || 'song'} captures raw vulnerability.`
        ],
        Relaxed: [
            `A calming ${genre || 'track'} with high acousticness — ideal for unwinding.`,
            `Gentle and soothing ${genre || 'piece'} perfect for relaxation and decompression.`,
            `Low-energy, peaceful ${genre || 'sound'} for those quiet, restful moments.`
        ],
        Focus: [
            `Instrumental-leaning ${genre || 'track'} with minimal distractions — great for deep work.`,
            `Steady, focused ${genre || 'piece'} designed to keep you in the zone.`,
            `A balanced ${genre || 'track'} with the right energy for concentration.`
        ],
        Romantic: [
            `A smooth, mid-tempo ${genre || 'track'} with just the right emotional sweetness.`,
            `Warm and intimate ${genre || 'piece'} with a danceable groove — perfect for date night.`,
            `This ${genre || 'song'} blends emotion and rhythm into a romantic soundscape.`
        ]
    };

    const pool = reasons[mood] || reasons.Focus;
    return pool[Math.floor(Math.random() * pool.length)];
}

// ===== RECOMMENDATIONS AND SORTING =====
export function sortByTimeOfDay(songs, time) {
    const scored = songs.map(s => {
        let fit = 0;
        switch (time) {
            case 'Morning':
                fit = s.valence * 2 + (1 - s.energyRaw) * 0.5 + s.acousticness * 1;
                break;
            case 'Afternoon':
                fit = s.danceability * 2 + s.valence * 1.5 + s.energyRaw * 0.5;
                break;
            case 'Evening':
                fit = s.danceability * 1.5 + s.energyRaw * 1 + s.valence * 1;
                break;
            case 'Night':
                fit = (1 - s.energyRaw) * 2 + (1 - s.valence) * 1.5 + s.acousticness * 1 + s.instrumentalness * 0.5;
                break;
        }
        return { song: s, fit };
    });

    scored.sort((a, b) => b.fit - a.fit);
    return scored.map(s => s.song);
}

export function computeSimilarity(a, b) {
    const weights = {
        energyRaw: 3,
        valence: 3,
        danceability: 2.5,
        acousticness: 2,
        instrumentalness: 1.5,
        speechiness: 1,
        liveness: 0.5,
        tempo: 1.5
    };

    let dist = 0;
    dist += weights.energyRaw * Math.pow(a.energyRaw - b.energyRaw, 2);
    dist += weights.valence * Math.pow(a.valence - b.valence, 2);
    dist += weights.danceability * Math.pow(a.danceability - b.danceability, 2);
    dist += weights.acousticness * Math.pow(a.acousticness - b.acousticness, 2);
    dist += weights.instrumentalness * Math.pow(a.instrumentalness - b.instrumentalness, 2);
    dist += weights.speechiness * Math.pow(a.speechiness - b.speechiness, 2);
    dist += weights.liveness * Math.pow(a.liveness - b.liveness, 2);

    const tempoA = ((a.tempo || 120) - 40) / 180;
    const tempoB = ((b.tempo || 120) - 40) / 180;
    dist += weights.tempo * Math.pow(tempoA - tempoB, 2);

    if (a.genre && b.genre && a.genre === b.genre) {
        dist *= 0.6;
    }

    return Math.sqrt(dist);
}

export function getTopGenres(songs, n) {
    const counts = {};
    songs.forEach(s => {
        if (s.genre) counts[s.genre] = (counts[s.genre] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(e => e[0]);
}

export function autoDetectTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) return 'Afternoon';
    else if (h >= 17 && h < 21) return 'Evening';
    else if (h >= 21 || h < 6) return 'Night';
    return 'Morning';
}
