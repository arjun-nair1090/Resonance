# Resonance AI: Deep Dive into Recommendation Logic & Feature Usage

This document provides a highly detailed breakdown of the exact algorithmic logic Resonance uses to recommend songs, the specific features of the music it evaluates, and the architectural constraints that drove these decisions.

## 1. The Core Constraint: Metadata vs. Audio Features

The most important architectural decision in Resonance is the use of the **iTunes Search API** as the primary music catalog. 

**Why iTunes?**
To build a functional, production-ready music app that users can actually listen to, we needed access to playable audio files. Spotify's API restricts audio playback to authenticated Premium users. The iTunes API provides universally accessible, 30-second `.m4a` audio previews for its entire catalog with zero authentication required.

**The Trade-off:**
Because we use iTunes, we **do not** have access to deep waveform audio features (e.g., Acousticness, Valence, Danceability, Tempo, Key) that platforms like Spotify compute via neural audio analysis. 

Instead, Resonance relies on **Rich Metadata Features** and **Behavioral/Contextual Heuristics**. The recommendation engine is essentially a sophisticated Information Retrieval (IR) and Multi-Factor Scoring system.

---

## 2. The Features Used for Recommendation

Resonance evaluates music based on three distinct feature vectors:

### A. Music Metadata Features (from iTunes)
*   **Artist Name (`artist_name`):** The primary indicator of sonic style and user affinity.
*   **Genre (`primaryGenreName`):** High-level categorization (e.g., "Alternative", "Pop", "Electronic").
*   **Track & Album Name (`track_name`, `collectionName`):** Used for semantic matching against moods and contexts.
*   **Global Popularity (Implicit):** iTunes returns search results naturally ordered by regional popularity and sales. We use the index position of a track in a raw search result as a proxy for its universal appeal.

### B. Behavioral Features (from PostgreSQL)
*   **Historical Play Count:** Total times a user has listened to a given artist or genre.
*   **Explicit Signals (Likes/Favorites):** Strong positive signals indicating explicit affinity for an `itunes_track_id`.

### C. Contextual Features (from the Session)
*   **Time of Day:** Divided into biological clusters (Morning, Afternoon, Evening, Night).
*   **Active Mood:** User-selected emotional state (Happy, Sad, Focus, Gym, etc.).
*   **Location:** City-level granularity (e.g., London, Tokyo) used to map cultural sonic signatures.

---

## 3. The Two-Phase Pipeline: How the Algorithm Works

We cannot rank the 50-million track iTunes library on every page load. Processing happens in two distinct real-time steps: **Candidate Retrieval (Sourcing)** and **Affinity Ranking (Scoring)**.

### Phase 1: Candidate Retrieval
The engine first needs to grab ~100 "plausible" songs. It does this by dynamically constructing search queries stringing together behavioral and contextual features.

**Example: Building the "Recommended For You" Pool**
1.  **Read Behavior:** The database query groups the user's `ListeningHistory` and `Favorites`, ordering by engagement. It discovers the user's Top 3 Artists (e.g., *Radiohead*, *Daft Punk*) and Top 2 Genres (e.g., *Electronic*).
2.  **Generate Queries:** It concatenates these into localized seed strings:
    *   `"Radiohead similar artists"`
    *   `"Daft Punk essentials"`
    *   `"Electronic essentials"`
3.  **Inject Context:** It grabs a rotating query based on the active mood/time to add variety (e.g., `"midnight focus"`).
4.  **Fetch & Filter:** It hits the iTunes API with these 6 queries, downloading ~20 tracks per query. It filters out tracks missing audio previews and forcefully deduplicates identical tracks or remixes to prevent cluster clogging.

### Phase 2: The Multi-Factor Scoring Engine
Once we have ~100 candidate tracks safely in memory (from Phase 1), the `HybridRecommendationEngine._rank()` function assigns a continuous float score to every single track. Tracks are sorted descending by this score.

Every track begins with a base score of `0.42`. We then layer on bonuses:

#### 1. Behavioral Affinity Scoring (Weight: High)
*   **Artist Match (+0.22):** If the track's `artist_name` matches exactly an artist in the user's historical Top 12 list, it receives the largest single bonus. We assume artist loyalty is the strongest predictive feature of enjoyment.
*   **Genre Match (+0.20):** If the track's `genre` (e.g., "Alternative") falls within the user's historical Top 10 listened genres, it receives a heavy bonus.

#### 2. Context & Semantic Scoring (Weight: Medium)
Because we lack true audio features (like `valence` for mood), we rely on semantic metadata matching. We run the track's `genre` and `track_name` through heuristic string matching.
*   **Mood Match (Max +0.10):**
    *   If mood is "Gym", and the track genre contains "hip-hop", "dance", or "electronic", it gains `+0.08`.
    *   If mood is "Relaxed", and the genre contains "acoustic" or "ambient", it gains `+0.05`.
*   **Time Match (Max +0.07):**
    *   If it's "Night" and the track is "blues" or "jazz", it gains `+0.07`. If "Morning" and it's "electronic", it might gain `0` or negative points.
*   **Location Match (Max +0.06):**
    *   A static dictionary maps cities to genres. For example, "London" boosts "grime" and "garage". "Tokyo" boosts "j-pop" and "kawaii".

#### 3. Popularity Decay (Weight: Low)
*   We add `max(0, 0.1 - (index * 0.003))` based on the track's original position in the iTunes search result. A track that was #1 in the raw search gets `+0.1`. A track that was #33 gets `+0.0`. This ensures obscure, potentially mis-tagged tracks don't accidentally float to the very top unless they perfectly match the user's history.

#### 4. The Jitter Variable (Weight: Micro)
*   We append `random() * 0.025` to the final score.
*   *Why?* If two tracks have identical metadata (e.g., two Pop tracks by the same artist), their scores would tie. Jitter ensures the sorting algorithm yields a slightly different ordering on page refreshes, which is psychologically critical for making the app feel "alive" and actively searching.

---

## 4. The Final Feedback Loop

The moment the layout is rendered, the "Recommended For You" rail displays the highest scoring tracks.

If the user clicks *Play* on a track they have never heard before, the React frontend immediately POSTs that event to the database, altering the user's Top Artists/Top Genres mathematical weighting. The frontend increments a `refreshNonce` variable, triggering the entire 2-phase pipeline all over again. 

Within 300 milliseconds, new seed queries are built reflecting the new artist, new tracks are fetched, and the UI re-renders with the algorithm physically warping around the user's latest action.
