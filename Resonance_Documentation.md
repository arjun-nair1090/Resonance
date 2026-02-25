# Resonance — Music Discovery Engine
**Documentation & Architecture Guide**

## Overview
Resonance (formerly SoundScape) is a purely static, client-side music discovery engine that operates on a real dataset of 10,000+ extracted Spotify track properties from a CSV (`Spotify_Song_Attributes.csv`). The app features advanced, weighted multi-attribute search and dynamic metadata scraping (from the iTunes API) to fetch missing album structures. No backend, database, or trained machine-learning model is required.

## System Architecture & "Training" Logic

While Resonance behaves like an AI recommendation engine, **it is not a pre-trained neural network**. Instead, it uses a deterministic algorithmic approach specifically leveraging a **Weighted K-Nearest Neighbors (KNN)** Euclidean distance algorithmic setup.

### 1. Data Processing Pipeline
Since no backend is attached, the entire logic handles data parsing locally in JavaScript (via `script.js`).
* **CSV Parsing:** `loadCSV()` asynchronously downloads the CSV file via local web server protocols, parses rows line by line (safely ignoring commas enclosed inside double quotes), and builds structural JavaScript objects representing tracks.
* **Deduplication Strategy:** The script parses the raw list and utilizes `deduplicateSongs()` which groups entries by their unique `id` (Spotify Track ID). For legacy CSV entries lacking an ID, a composite fallback key of `title|artist` is utilized to ensure duplicate listening sessions in the CSV don't spam the UI.

### 2. The Recommendation Engine (The "Model")
Instead of a trained model deciding what the user wants, the platform dynamically computes vectors based on user inputs in real-time.
* **Mood Engine Calculation:** The system doesn't rely on pre-labeled mood string values. Instead, it derives an internal 'Mood' organically from Spotify's raw Audio Attributes (`valence`, `energy`, `danceability`, `acousticness`, `instrumentalness`):
  * **Happy:** High valence, moderate-high energy
  * **Melancholy:** Low valence, high acousticness
  * **Energetic:** High energy, high tempo
  * **Relaxed:** Low energy, moderate valence
  * **Focus:** High instrumentalness, low speechiness
* **Time of Day Sorting:** Reverses the algorithm. Selecting "Morning" favors high acousticness and upbeat valence, whereas "Night" favors extremely low energy and low tempo tracks.
* **Search / Find Similar (Euclidean Distance Model):** The true core intelligence of the application relies on computing a relative distance score across multi-dimensional floating variables: `energy`, `valence`, `danceability`, `acousticness`, `instrumentalness`, `speechiness`, and `liveness`.
    - Distinct weights are uniquely assigned (e.g., Valence and Energy are considered ~3x heavier than Liveness to find actually similar sounding songs instead of mathematically similar metadata).
    - Hard matches on identical `genre` strings provide a heavy bonus modifier (acting as negative distance) to intentionally boost tracks in similar actual genres up the search rank list.

### 3. Dynamic Metadata Enrichment (iTunes API)
The original CSV dataset completely lacks album artwork.
To enrich the experience and make it feel like a premium application, Resonance uses an asynchronous lazy-loading intersection observer (`coverObserver`).
1. When a `.music-card` is rendered, the `script.js` fires a lightweight, client-side API ping to `https://itunes.apple.com/search?term=[Song Title]+[Artist Name]+song&limit=1`.
2. The endpoint returns the highest-confidence match for the song.
3. `artworkUrl100` string is parsed, modified, and up-scaled on the fly to `300x300bb` format so that the DOM renders high-quality 300px album artwork dynamically.
4. **Fallback Handling:** To preserve geometric layout shifts (CLS), cards fallback exactly to a dark geometric hue generated algorithmically using a random mathematical seed: `(song.title.charCodeAt(0) * 137 + song.artist.charCodeAt(0) * 53) % 360` so that each song retains a static and totally unique identity card even if the iTunes API fails to find it.

## UI / UX Design Paradigm
The UI was overhauled to utilize a **Premium Minimalist Dark Mode** aesthetic entirely handled in `style.css`.
* **Typography:** Font framework shifted to `Plus Jakarta Sans`, a heavily-used font in high-end UI design.
* **Performance:** `IntersectionObserver` handles continuous DOM scrolling to stagger entry animations natively on the GPU instead of bogging the CPU down.
* **Cross-Browser Safe:** `<select>` and Form elements are restyled explicitly into dark mode to prevent Windows Chrome local system inheritance bugs (which could cause invisible text on dropdowns).
* **Z-Indexing:** Album art utilizes complex overlapping `z-index` layering strategies explicitly binding `position: absolute` containers above the geometric placeholders without CSS hover zooming causing structural jittering.

## How to Expansion / Modify the "Model"
This application fundamentally acts as a localized KNN-style multi-parameter engine.
If you wish to "train" or tweak the engine's parameters:
1. **Adding Data:** Simply swap or append to `Spotify_Song_Attributes.csv` ensuring columns like `energy`, `valence`, and `danceability` remain mapped from `0.0` to `1.0`.
2. **Tweaking Intelligence:** Open `script.js` and locate the `findSimilar()` block. Adjust the nested `weights` dictionary. For example, if you want "Find Similar" buttons to aggressively only suggest songs with the exact same beat speed, you can drastically boost the `tempo` weight relative to the dataset distance calculation arrays.
3. **Favorites Export:** The `resonance_favorites` LocalStorage array securely stores the numeric Spotify ID strings of saved user tracks without needing a persistent SQL backend schema. This data could later be parsed identically to output custom CSVs back.
