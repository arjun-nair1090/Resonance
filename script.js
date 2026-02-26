// ============================================================
// SoundScape — Smart Music Discovery (Spotify Dataset Edition)
// ============================================================

let allSongs = [];

let displayedSongs = [];
let favorites = JSON.parse(localStorage.getItem('resonance_favorites') || '[]');
let currentView = 'all';
let currentSimilarSong = null;
let allGenres = [];

// ===== OBSERVERS =====
let coverObserver;
let entranceObserver;

function initObservers() {
    coverObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                fetchCoverArt(img);
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px 0px' });

    entranceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
}

async function fetchCoverArt(img) {
    const track = img.dataset.track;
    const artist = img.dataset.artist;
    try {
        const query = encodeURIComponent(`${track} ${artist} song`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const url = data.results[0].artworkUrl100.replace('100x100bb', '300x300bb');
            img.src = url;
            img.onload = () => img.classList.add('loaded');
        }
    } catch (e) {
        // Silent fail, fallback placeholder remains visible
    }
}

// ===== CSV PARSING =====
async function loadCSV() {
    try {
        const response = await fetch('Spotify_Song_Attributes.csv');
        const text = await response.text();
        allSongs = deduplicateSongs(parseCSV(text));
        allGenres = [...new Set(allSongs.map(s => s.genre).filter(Boolean))].sort();
        populateGenreDropdown();
        populateGenreTags();
        autoDetectTimeOfDay();
        generateRecommendations();
        updateFavCount();
    } catch (err) {
        console.error('Failed to load CSV:', err);
        document.getElementById('results').innerHTML =
            '<p style="text-align:center;color:var(--text-secondary);grid-column:1/-1;">Failed to load song data. Make sure Spotify_Song_Attributes.csv is in the same folder.</p>';
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
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

    return songs;
}

function deduplicateSongs(songs) {
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

function parseCSVLine(line) {
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

function cleanQuotes(str) {
    if (!str) return '';
    return str.replace(/^"+|"+$/g, '').trim();
}


// ===== MOOD DERIVATION =====
function deriveMood(valence, energy, danceability, acousticness, instrumentalness) {
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

function deriveVibe(valence, energy, danceability, tempo) {
    if (energy > 0.8 && tempo > 140) return 'Party';
    if (energy > 0.7 && danceability > 0.7) return 'Dance';
    if (valence > 0.7 && energy > 0.5) return 'Feel Good';
    if (energy < 0.3 && valence < 0.4) return 'Late Night';
    if (energy < 0.4 && valence < 0.5) return 'Chill';
    if (danceability > 0.7) return 'Groovy';
    return 'Vibe';
}


// ===== REASON GENERATION =====
function generateReason(mood, energy, valence, danceability, genre, tempo) {
    const reasons = {
        Happy: [
            `A feel-good ${genre || 'track'} with high positivity (${(valence * 100).toFixed(0)}%) — guaranteed to lift your spirits.`,
            `Upbeat and joyful with ${(danceability * 100).toFixed(0)}% danceability — perfect for happy moments.`,
            `This bright ${genre || 'song'} radiates pure positivity and good vibes.`
        ],
        Energetic: [
            `High-energy ${genre || 'banger'} at ${tempo.toFixed(0)} BPM — perfect for workouts or getting pumped.`,
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


// ===== GENRE MANAGEMENT =====
function populateGenreDropdown() {
    const select = document.getElementById('genre');
    // Keep "All Genres" as first option
    const topGenres = getTopGenres(30);
    topGenres.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        select.appendChild(opt);
    });
}

function populateGenreTags() {
    const container = document.getElementById('genreTags');
    container.innerHTML = '<button class="genre-tag active" data-genre="All">All</button>';
    const topGenres = getTopGenres(15);
    topGenres.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'genre-tag';
        btn.dataset.genre = g;
        btn.textContent = g;
        container.appendChild(btn);
    });

    // Rebind tag events
    container.querySelectorAll('.genre-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            container.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            document.getElementById('genre').value = tag.dataset.genre;
            if (!currentSimilarSong) generateRecommendations();
        });
    });
}

function getTopGenres(n) {
    const counts = {};
    allSongs.forEach(s => {
        if (s.genre) counts[s.genre] = (counts[s.genre] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(e => e[0]);
}


// ===== AUTO-DETECT TIME =====
function autoDetectTimeOfDay() {
    const h = new Date().getHours();
    let time = 'Morning';
    if (h >= 12 && h < 17) time = 'Afternoon';
    else if (h >= 17 && h < 21) time = 'Evening';
    else if (h >= 21 || h < 6) time = 'Night';
    document.getElementById('timeOfDay').value = time;
}


// ===== EVENT BINDINGS =====
function bindEvents() {
    document.getElementById('recommendBtn').addEventListener('click', () => {
        const btn = document.getElementById('recommendBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 150);
        currentSimilarSong = null;
        hideSimilarBanner();
        generateRecommendations();
    });

    document.getElementById('shuffleBtn').addEventListener('click', () => {
        const btn = document.getElementById('shuffleBtn');
        btn.classList.add('animating');
        setTimeout(() => btn.classList.remove('animating'), 500);
        shuffleDiscover();
    });

    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchInput);
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            document.getElementById('searchDropdown').classList.add('hidden');
        }
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.classList.add('hidden');
        document.getElementById('searchDropdown').classList.add('hidden');
        currentSimilarSong = null;
        hideSimilarBanner();
        generateRecommendations();
    });

    document.getElementById('clearSimilar').addEventListener('click', () => {
        currentSimilarSong = null;
        hideSimilarBanner();
        generateRecommendations();
    });

    ['timeOfDay', 'mood', 'genre'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (id === 'genre') {
                const val = document.getElementById('genre').value;
                document.querySelectorAll('.genre-tag').forEach(t => {
                    t.classList.toggle('active', t.dataset.genre === val);
                });
            }
            if (!currentSimilarSong) generateRecommendations();
        });
    });

    document.getElementById('allSongsView').addEventListener('click', () => {
        currentView = 'all';
        document.getElementById('allSongsView').classList.add('active');
        document.getElementById('favoritesView').classList.remove('active');
        generateRecommendations();
    });

    document.getElementById('favoritesView').addEventListener('click', () => {
        currentView = 'favorites';
        document.getElementById('favoritesView').classList.add('active');
        document.getElementById('allSongsView').classList.remove('active');
        showFavorites();
    });
}


// ===== SEARCH =====
function handleSearchInput() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    const clearBtn = document.getElementById('clearSearch');

    clearBtn.classList.toggle('hidden', query.length === 0);

    if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    const matches = allSongs.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query)
    ).slice(0, 10);

    if (matches.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item"><div class="dropdown-item-info"><span class="dropdown-item-title">No songs found</span><span class="dropdown-item-meta">Try a different search term</span></div></div>';
        dropdown.classList.remove('hidden');
        return;
    }

    dropdown.innerHTML = matches.map(song => `
        <div class="dropdown-item" data-id="${song.id}">
            <div class="dropdown-cover-placeholder">${song.title.charAt(0).toUpperCase()}</div>
            <div class="dropdown-item-info">
                <div class="dropdown-item-title">${highlightMatch(song.title, query)}</div>
                <div class="dropdown-item-meta">${escapeHtml(song.artist)} · ${escapeHtml(song.genre) || 'Unknown'} · ${song.mood}</div>
            </div>
            <span class="find-similar-hint">Find Similar →</span>
        </div>
    `).join('');

    dropdown.querySelectorAll('.dropdown-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const song = allSongs.find(s => s.id === id);
            if (song) findSimilar(song);
            dropdown.classList.add('hidden');
        });
    });

    dropdown.classList.remove('hidden');
}

function highlightMatch(text, query) {
    const escaped = escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return escaped;
    const before = escapeHtml(text.slice(0, idx));
    const match = escapeHtml(text.slice(idx, idx + query.length));
    const after = escapeHtml(text.slice(idx + query.length));
    return `${before}<mark style="background:rgba(167,139,250,0.3);color:inherit;border-radius:2px;padding:0 2px;">${match}</mark>${after}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


// ===== FIND SIMILAR (Euclidean Distance on audio features) =====
function findSimilar(song) {
    currentSimilarSong = song;

    document.getElementById('searchInput').value = song.title;
    document.getElementById('clearSearch').classList.remove('hidden');

    document.getElementById('similarTitle').textContent = `Similar to: ${song.title} by ${song.artist}`;
    document.getElementById('similarSubtitle').textContent = `Based on audio features: energy, valence, danceability, acousticness, tempo`;
    document.getElementById('similarBanner').classList.remove('hidden');

    const scored = allSongs
        .filter(s => s.id !== song.id)
        .map(s => ({ song: s, score: computeSimilarity(song, s) }))
        .sort((a, b) => a.score - b.score) // Lower distance = more similar
        .slice(0, 20);

    const results = scored.map(s => s.song);
    renderCards(results);
    updateInsights(results);

    currentView = 'all';
    document.getElementById('allSongsView').classList.add('active');
    document.getElementById('favoritesView').classList.remove('active');
}

function computeSimilarity(a, b) {
    // Weighted Euclidean distance across normalized audio features
    const weights = {
        energyRaw: 3,
        valence: 3,
        danceability: 2.5,
        acousticness: 2,
        instrumentalness: 1.5,
        speechiness: 1,
        liveness: 0.5,
        tempo: 1.5 // needs normalization
    };

    let dist = 0;
    dist += weights.energyRaw * Math.pow(a.energyRaw - b.energyRaw, 2);
    dist += weights.valence * Math.pow(a.valence - b.valence, 2);
    dist += weights.danceability * Math.pow(a.danceability - b.danceability, 2);
    dist += weights.acousticness * Math.pow(a.acousticness - b.acousticness, 2);
    dist += weights.instrumentalness * Math.pow(a.instrumentalness - b.instrumentalness, 2);
    dist += weights.speechiness * Math.pow(a.speechiness - b.speechiness, 2);
    dist += weights.liveness * Math.pow(a.liveness - b.liveness, 2);
    // Normalize tempo to 0-1 range (assuming 40-220 BPM range)
    const tempoA = (a.tempo - 40) / 180;
    const tempoB = (b.tempo - 40) / 180;
    dist += weights.tempo * Math.pow(tempoA - tempoB, 2);

    // Genre bonus: if same genre, reduce distance
    if (a.genre && b.genre && a.genre === b.genre) {
        dist *= 0.6;
    }

    return Math.sqrt(dist);
}

function hideSimilarBanner() {
    document.getElementById('similarBanner').classList.add('hidden');
}


// ===== MAIN RECOMMENDATIONS =====
function generateRecommendations() {
    if (currentSimilarSong) return;

    const timeOfDay = document.getElementById('timeOfDay').value;
    const mood = document.getElementById('mood').value;
    const genre = document.getElementById('genre').value;

    let results = [...allSongs];

    // Mood filter
    if (mood !== 'All') {
        results = results.filter(s => s.mood === mood);
    }

    // Genre filter
    if (genre !== 'All') {
        results = results.filter(s => s.genre === genre);
    }

    // Time of day: influence sort by energy/vibe
    if (timeOfDay !== 'All') {
        results = sortByTimeOfDay(results, timeOfDay);
    } else {
        // Default sort by a mix of popularity-proxy (msPlayed isn't reliable here, sort by energy desc)
        results.sort((a, b) => b.energyRaw - a.energyRaw);
    }

    // Limit to 30 results for performance
    results = results.slice(0, 30);

    renderCards(results);
    updateInsights(results);
}

function sortByTimeOfDay(songs, time) {
    // Score songs by how well they fit the time of day
    const scored = songs.map(s => {
        let fit = 0;
        switch (time) {
            case 'Morning':
                // Prefer moderate energy, higher valence, acoustic
                fit = s.valence * 2 + (1 - s.energyRaw) * 0.5 + s.acousticness * 1;
                break;
            case 'Afternoon':
                // Prefer balanced energy, good danceability
                fit = s.danceability * 2 + s.valence * 1.5 + s.energyRaw * 0.5;
                break;
            case 'Evening':
                // Prefer medium energy, higher danceability, some valence
                fit = s.danceability * 1.5 + s.energyRaw * 1 + s.valence * 1;
                break;
            case 'Night':
                // Prefer low energy, low valence, high acousticness/instrumentalness
                fit = (1 - s.energyRaw) * 2 + (1 - s.valence) * 1.5 + s.acousticness * 1 + s.instrumentalness * 0.5;
                break;
        }
        return { song: s, fit };
    });

    scored.sort((a, b) => b.fit - a.fit);
    return scored.map(s => s.song);
}


// ===== FAVORITES =====
function showFavorites() {
    const favSongs = allSongs.filter(s => favorites.includes(s.id));
    renderCards(favSongs);
    updateInsights(favSongs);
}

function toggleFavorite(songId) {
    const idx = favorites.indexOf(songId);
    if (idx > -1) {
        favorites.splice(idx, 1);
    } else {
        favorites.push(songId);
    }
    localStorage.setItem('resonance_favorites', JSON.stringify(favorites));
    updateFavCount();

    const btn = document.querySelector(`.fav-btn[data-id="${songId}"]`);
    if (btn) {
        btn.classList.toggle('favorited');
        btn.textContent = favorites.includes(songId) ? '★' : '☆';
        btn.style.animation = 'none';
        requestAnimationFrame(() => { btn.style.transform = 'scale(1.1)'; setTimeout(() => btn.style.transform = 'none', 150); });
    }

    if (currentView === 'favorites') showFavorites();
}

function updateFavCount() {
    document.getElementById('favCount').textContent = favorites.length;
}


// ===== SHUFFLE =====
function shuffleDiscover() {
    currentSimilarSong = null;
    hideSimilarBanner();
    const shuffled = [...allSongs].sort(() => Math.random() - 0.5).slice(0, 20);
    renderCards(shuffled);
    updateInsights(shuffled);
}


// ===== RENDER CARDS =====
function renderCards(songs) {
    const container = document.getElementById('results');
    const heading = document.getElementById('resultsHeading');
    const noResults = document.getElementById('noResults');

    const existingCards = container.querySelectorAll('.music-card');
    if (existingCards.length > 0) {
        existingCards.forEach((card, i) => {
            card.style.animationDelay = '0s';
            card.classList.remove('animate-in');
            card.classList.add('animate-out');
            card.style.animationDelay = `${Math.min(i, 15) * 0.02}s`;
        });
        setTimeout(() => {
            executeRender(songs, container, heading, noResults);
        }, 300 + Math.min(existingCards.length, 15) * 20);
    } else {
        executeRender(songs, container, heading, noResults);
    }
}

function executeRender(songs, container, heading, noResults) {
    container.innerHTML = '';

    if (songs.length === 0) {
        heading.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    heading.classList.remove('hidden');

    if (currentSimilarSong) {
        heading.textContent = `Found ${songs.length} similar tracks`;
    } else if (currentView === 'favorites') {
        heading.textContent = `${songs.length} Saved track${songs.length !== 1 ? 's' : ''}`;
    } else {
        heading.textContent = `Found ${songs.length} recommendation${songs.length !== 1 ? 's' : ''}`;
    }

    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';

        const isFav = favorites.includes(song.id);
        const energyDots = Array.from({ length: 5 }, (_, i) =>
            `<span class="energy-dot ${i < song.energy ? 'filled' : ''}"></span>`
        ).join('');

        const initial = song.title.charAt(0).toUpperCase();
        // Generate a muted/pastel background instead of a neon gradient
        const hue = (song.title.charCodeAt(0) * 137 + song.artist.charCodeAt(0) * 53) % 360;

        const durationStr = song.durationMs ? formatDuration(song.durationMs) : '';
        const tempoStr = song.tempo ? `${song.tempo.toFixed(0)} BPM` : '';
        const spotifyLink = song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : '';

        card.innerHTML = `
            <div class="cover-art-wrapper">
                <div class="cover-placeholder" style="background: hsl(${hue}, 20%, 40%);">
                    <span class="cover-initial">${initial}</span>
                </div>
                <img class="cover-img" data-track="${escapeHtml(song.title)}" data-artist="${escapeHtml(song.artist)}" crossorigin="anonymous" />
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="title" title="${escapeHtml(song.title)}">${escapeHtml(song.title)}</h3>
                    <button class="fav-btn ${isFav ? 'favorited' : ''}" data-id="${song.id}" title="Save track">${isFav ? '★' : '☆'}</button>
                </div>
                <p class="artist">${escapeHtml(song.artist)}</p>
                <div class="card-tags">
                    <span class="card-tag mood-tag">${song.mood}</span>
                    ${song.genre ? `<span class="card-tag genre-tag-card">${escapeHtml(song.genre)}</span>` : ''}
                    ${song.vibe ? `<span class="card-tag">${song.vibe}</span>` : ''}
                    ${tempoStr ? `<span class="card-tag">${tempoStr}</span>` : ''}
                </div>
                <div class="info-card">
                    <strong>Why this was recommended</strong>
                    ${escapeHtml(song.reason)}
                </div>
                <div class="card-footer">
                    <div class="energy-bar">
                        <span>Energy</span>
                        <div class="energy-dots">${energyDots}</div>
                    </div>
                    <div class="card-actions">
                        ${durationStr ? `<span class="duration-badge">${durationStr}</span>` : ''}
                        ${spotifyLink ? `<a href="${spotifyLink}" target="_blank" rel="noopener" class="spotify-btn" title="Open in Spotify">🎧</a>` : ''}
                        <button class="similar-btn" data-id="${song.id}">Find Similar</button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);

        // Add staggered entrance delay for initial visible cards
        if (index < 12) {
            card.style.animationDelay = `${index * 0.05}s`;
        }

        // Observe for lazy loading and entrance
        entranceObserver.observe(card);
        const img = card.querySelector('.cover-img');
        if (img) coverObserver.observe(img);
    });

    // Smooth scroll down to the grid organically if it's a large search
    if (songs.length > 0) {
        setTimeout(() => {
            const y = heading.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
    }

    // Bind events
    container.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(parseInt(btn.dataset.id));
        });
    });

    container.querySelectorAll('.similar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const song = allSongs.find(s => s.id === parseInt(btn.dataset.id));
            if (song) {
                findSimilar(song);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function formatDuration(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}


// ===== INSIGHTS =====
function updateInsights(songs) {
    document.getElementById('totalSongs').textContent = songs.length;

    if (songs.length === 0) {
        document.getElementById('topGenre').textContent = '—';
        document.getElementById('avgEnergy').textContent = '—';
        return;
    }

    const genreCounts = {};
    songs.forEach(s => {
        if (s.genre) genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
    });
    const entries = Object.entries(genreCounts);
    const topGenre = entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : '—';
    document.getElementById('topGenre').textContent = topGenre;

    const avg = (songs.reduce((sum, s) => sum + s.energyRaw, 0) / songs.length * 100).toFixed(0);
    document.getElementById('avgEnergy').textContent = `${avg}%`;
}


// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initObservers();
    bindEvents();
    loadCSV();
});
