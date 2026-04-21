"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  ListBulletIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PlusIcon,
  QueueListIcon,
  SparklesIcon,
  Squares2X2Icon,
  XMarkIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { AdminPanel } from "@/components/AdminPanel";
import { AuthPanel } from "@/components/AuthPanel";
import { Player } from "@/components/Player";
import { SectionRail } from "@/components/SectionRail";
import { TrackCard } from "@/components/TrackCard";
import { api } from "@/lib/api";
import { locationContexts, moods } from "@/lib/utils";
import { AdminDashboard, Playlist, RecommendationSection, Song, User } from "@/lib/types";

type View = "discover" | "search" | "ai-playlists" | "favorites" | "library" | "admin";

export function PortalPage() {
  const pathname = usePathname();
  const router = useRouter();
  const view = routeToView(pathname);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mood, setMood] = useState("Happy");
  const [locationContext, setLocationContext] = useState("Auto");
  const [detectedLocation, setDetectedLocation] = useState("Detecting context");
  const [query, setQuery] = useState("A R Rahman");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [generatedTracks, setGeneratedTracks] = useState<Song[]>([]);
  const [libraryTracks, setLibraryTracks] = useState<Song[]>([]);
  const [admin, setAdmin] = useState<AdminDashboard | null>(null);
  const [current, setCurrent] = useState<Song | undefined>();
  const [queue, setQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [currentGeohash, setCurrentGeohash] = useState<string | null>(null);
  const [frequentGeohash, setFrequentGeohash] = useState<string | null>(null);
  const [locationVisits, setLocationVisits] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const activeLocation = locationContext === "Auto"
    ? detectedLocation.startsWith("City") ? user?.city || "City" : detectedLocation.split(" ")[0] || "City"
    : locationContext;

  useEffect(() => {
    const saved = localStorage.getItem("resonance_token");
    if (!saved) return;
    api.me(saved)
      .then((me) => {
        setToken(saved);
        setUser(me);
      })
      .catch(() => localStorage.removeItem("resonance_token"));
  }, []);

  useEffect(() => {
    detectLocationContext();
  }, []);

  useEffect(() => {
    if (!token) return;
    refresh(token);
  }, [token, mood, activeLocation, user?.is_admin, refreshNonce]);

  // Re-ping GPS whenever the token becomes available (or every 5 minutes).
  useEffect(() => {
    if (!token) return;
    detectLocationContext(token);
    const interval = setInterval(() => detectLocationContext(token), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning intelligence is live";
    if (hour < 17) return "Focus mode is dialed in";
    if (hour < 22) return "Evening discovery is tuned";
    return "Night recommendations are soft-lit";
  }, []);

  async function refresh(activeToken = token) {
    setLoading(true);
    try {
      const [recs, recentTracks, favs, pls] = await Promise.all([
        api.recommendations({ mood, city: activeLocation, geohash: currentGeohash ?? undefined, refresh_nonce: refreshNonce, limit: 12 }, activeToken),
        api.recent(activeToken).catch(() => []),
        api.favorites(activeToken).catch(() => []),
        api.playlists(activeToken).catch(() => [])
      ]);
      setRecent(recentTracks);
      setFavorites(favs);
      setSections([
        ...recs,
        { title: "Continue Listening", key: "recent", reason: "Your latest plays stay warm across every page.", tracks: recentTracks },
        { title: "Favorites", key: "favorites", reason: "Tracks you keep coming back to.", tracks: favs }
      ].filter((section) => section.tracks.length > 0));
      setPlaylists(pls);
      if (user?.is_admin) api.admin(activeToken).then(setAdmin).catch(() => setAdmin(null));
    } finally {
      setLoading(false);
    }
  }

  function detectLocationContext(activeToken?: string) {
    if (!navigator.geolocation) {
      setDetectedLocation("City mode");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, altitude } = position.coords;
        const nearMumbaiCoast = latitude > 18 && latitude < 20 && longitude > 72 && longitude < 73.5;
        const coastalSignal = Math.abs(longitude % 10) < 1.2;
        if ((altitude || 0) > 900) setDetectedLocation("Mountains mode");
        else if (nearMumbaiCoast || coastalSignal) setDetectedLocation("Beach mode");
        else setDetectedLocation("City mode");

        // Send GPS coordinates to backend to get the micro-location geohash.
        if (activeToken) {
          try {
            const result = await api.trackLocation(latitude, longitude, activeToken);
            setCurrentGeohash(result.geohash);
            setFrequentGeohash(result.frequent_geohash);
            setLocationVisits(result.visit_count);
          } catch {
            // Non-critical: silent fail — recommendations still work without geohash.
          }
        }
      },
      () => setDetectedLocation("City mode"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 * 60 * 5 }
    );
  }

  async function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim() || !token) return;
    setLoading(true);
    try {
      setSearchResults(await api.search(query, token));
    } finally {
      setLoading(false);
    }
  }

  async function play(song: Song) {
    if (current && current.itunes_track_id !== song.itunes_track_id) {
      setHistory((items) => [current, ...items].slice(0, 24));
    }
    setCurrent(song);
    if (token) {
      await api.event({ itunes_track_id: song.itunes_track_id, action: "play", mood, city: activeLocation, geohash: currentGeohash ?? undefined, context: { locationContext: activeLocation, geohash: currentGeohash }, song }, token).catch(() => undefined);
      setRefreshNonce((n) => n + 1);
    }
  }

  async function like(song: Song) {
    if (!token) return;
    await api.event({ itunes_track_id: song.itunes_track_id, action: "favorite", mood, city: activeLocation, geohash: currentGeohash ?? undefined, song }, token);
    await refresh();
  }

  async function explore(section: RecommendationSection) {
    if (!token) return;
    let tracks: Song[] = [];
    if (section.key === "artist") {
      const artists = dedupeStrings([...recent, ...favorites, ...section.tracks].map((track) => track.artist_name)).slice(0, 4);
      const batches = await Promise.all(artists.map((artist) => api.search(`${artist} essentials`, token).catch(() => [])));
      tracks = dedupeSongs(batches.flat());
    } else if (section.key === "mood") {
      const batches = await Promise.all([
        api.search(`${mood} feel good mix`, token).catch(() => []),
        api.search(`${mood} essentials`, token).catch(() => []),
        api.search(`${mood} vibe songs`, token).catch(() => [])
      ]);
      tracks = dedupeSongs(batches.flat());
    } else if (section.key === "time" || section.key === "night") {
      const label = section.key === "night" ? "night drive" : `${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} mix`;
      const batches = await Promise.all([
        api.search(label, token).catch(() => []),
        api.search(`${label} songs`, token).catch(() => []),
        api.search(`${label} essentials`, token).catch(() => [])
      ]);
      tracks = dedupeSongs(batches.flat());
    } else if (section.key === "hidden") {
      const batches = await Promise.all([
        api.search("underrated indie electronic", token).catch(() => []),
        api.search("alternative deep cuts", token).catch(() => []),
        api.search("neo soul hidden gems", token).catch(() => [])
      ]);
      tracks = dedupeSongs(batches.flat());
    } else if (section.key === "discover" || section.key === "recommended") {
      const artists = dedupeStrings([...recent, ...favorites].map((track) => track.artist_name)).slice(0, 3);
      const seeds = artists.length ? artists.map((artist) => `${artist} similar artists`) : [`${mood} discovery`, "fresh finds", "discover weekly"];
      const batches = await Promise.all(seeds.map((seed) => api.search(seed, token).catch(() => [])));
      tracks = dedupeSongs(batches.flat());
    } else if (section.key === "workout") {
      const batches = await Promise.all([
        api.search("workout hits", token).catch(() => []),
        api.search("gym anthems", token).catch(() => []),
        api.search("high energy mix", token).catch(() => [])
      ]);
      tracks = dedupeSongs(batches.flat());
    }
    setSearchResults(tracks);
    setQueue((items) => [...items, ...tracks.slice(0, 8)]);
    setStatus(`Showing more from ${section.title}. Added ${Math.min(8, tracks.length)} songs to Up Next.`);
    router.push("/search");
  }

  function addToQueue(song: Song) {
    setQueue((items) => [...items, song]);
  }

  function removeFromQueue(index: number) {
    setQueue((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function playNext() {
    const [next, ...rest] = queue;
    setQueue(rest);
    if (next) play(next);
  }

  function playPrevious() {
    if (history[0]) {
      const [previous, ...rest] = history;
      setHistory(rest);
      play(previous);
    }
  }

  function nextTrack() {
    if (queue[0]) {
      const [next, ...rest] = queue;
      setQueue(rest);
      play(next);
      return;
    }
    const autoplay = dedupeSongs(sections.flatMap((section) => section.tracks)).find((track) => track.itunes_track_id !== current?.itunes_track_id);
    if (autoplay) play(autoplay);
  }

  function shuffleQueue() {
    setQueue((items) => [...items].sort(() => Math.random() - 0.5));
  }

  function handleEnded(repeatMode: "off" | "all" | "one") {
    if (repeatMode === "one" && current) {
      play(current);
      return;
    }
    if (queue[0]) {
      nextTrack();
      return;
    }
    const autoplay = dedupeSongs(sections.flatMap((section) => section.tracks)).find((track) => track.itunes_track_id !== current?.itunes_track_id);
    if (autoplay) {
      play(autoplay);
      return;
    }
    if (repeatMode === "all" && current) {
      play(current);
    }
  }

  async function generateAiPlaylist() {
    if (!token) return;
    setStatus("Generating from your actual listening graph...");
    const recs = await api.recommendations({ mood, city: activeLocation, refresh_nonce: refreshNonce, limit: 8 }, token);
    const tracks = dedupeSongs([...recent, ...favorites, ...recs.flatMap((section) => section.tracks)]).slice(0, 16);
    const name = buildPlaylistName({ mood, activeLocation, recent, favorites, tracks });
    const playlist = await api.createPlaylist(
      {
        name,
        description: `Generated from your recent listens, favorites, ${mood.toLowerCase()} mood, and ${activeLocation.toLowerCase()} context.`,
        is_public: true
      },
      token
    );
    await Promise.all(tracks.map((track) => api.addTrack(playlist.id, track, token).catch(() => undefined)));
    setPlaylists((items) => [playlist, ...items]);
    setGeneratedTracks(tracks);
    setQueue(tracks);
    setStatus(`Created ${playlist.name}. Added ${tracks.length} playable tracks to Up Next.`);
  }

  async function createManualPlaylist(event: FormEvent) {
    event.preventDefault();
    if (!token || !newPlaylistName.trim()) return;
    setCreateLoading(true);
    try {
      const playlist = await api.createPlaylist(
        { name: newPlaylistName.trim(), description: newPlaylistDesc.trim() || undefined, is_public: false },
        token
      );
      setPlaylists((items) => [playlist, ...items]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowCreateModal(false);
      setStatus(`Playlist "${playlist.name}" created. Open it to add tracks from Search.`);
    } finally {
      setCreateLoading(false);
    }
  }

  async function loadPlaylist(playlist: Playlist) {
    if (!token) return;
    setStatus(`Opening ${playlist.name}...`);
    const tracks = await api.playlistTracks(playlist.id, token).catch(() => []);
    setLibraryTracks(tracks);
    setQueue(tracks);
    setStatus(`${playlist.name} loaded with ${tracks.length} tracks.`);
  }

  if (!token || !user) {
    return <AuthPanel onAuth={(nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); }} />;
  }

  const nav = [
    { href: "/", label: "Discover", icon: <SparklesIcon className="size-4" /> },
    { href: "/search", label: "Search", icon: <MagnifyingGlassIcon className="size-4" /> },
    { href: "/playlists", label: "AI Playlists", icon: <MusicalNoteIcon className="size-4" /> },
    { href: "/favorites", label: "Favorites", icon: <HeartIcon className="size-4" /> },
    { href: "/library", label: "Playlists", icon: <ListBulletIcon className="size-4" /> },
    ...(user.is_admin ? [{ href: "/admin", label: "Admin", icon: <ChartBarIcon className="size-4" /> }] : [])
  ];

  return (
    <main className="min-h-screen pb-28">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-pulse text-ink shadow-glow">
                <MusicalNoteIcon className="size-6" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.3em] text-aqua">Resonance</span>
                <span className="block text-lg font-black text-white">Adaptive Listening</span>
              </span>
            </Link>
            <nav className="flex max-w-full gap-2 overflow-x-auto rounded-lg border border-white/10 bg-white/7 p-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${pathname === item.href ? "bg-pulse text-ink" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
            <button onClick={() => { localStorage.removeItem("resonance_token"); setToken(""); setUser(null); }} className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/72 hover:border-pulse hover:text-pulse">
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-5 pt-6 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="glass relative overflow-hidden rounded-lg p-5 shadow-glow">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff6b57,#ff8b6a,#65e0d2,#92f2ff)]" />
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-aqua">{greeting}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-lg bg-pulse text-ink shadow-glow">
                    <MusicalNoteIcon className="size-6" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-aqua">Resonance</p>
                    <p className="text-sm text-white/48">Adaptive listening intelligence</p>
                  </div>
                </div>
                <h1 className="mt-4 text-4xl font-black leading-tight text-balance sm:text-6xl">Music that adapts the second your taste shifts.</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62">
                  Mood sets intent. Listening history keeps the model honest. Every play, favorite, and skip reshapes the next wave of songs.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {moods.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        if (item === mood) setRefreshNonce((value) => value + 1);
                        setMood(item);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${item === mood ? "bg-pulse text-ink" : "bg-white/8 text-white/62 hover:bg-white/12 hover:text-white"}`}
                    >
                      {item}
                    </button>
                  ))}
                  <button onClick={() => setRefreshNonce((value) => value + 1)} className="flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-pulse hover:text-pulse">
                    <ArrowPathIcon className="size-4" />
                    Refresh taste
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                <Control label="Location context" value={locationContext} values={locationContexts} onChange={setLocationContext} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={<MapPinIcon className="size-5" />} label="Auto context" value={locationContext === "Auto" && detectedLocation.startsWith("City") ? `${user?.city || "City"} mode` : locationContext === "Auto" ? detectedLocation : `${locationContext} mode`} />
              <Metric icon={<ClockIcon className="size-5" />} label="Time model" value={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
              <Metric icon={<BoltIcon className="size-5" />} label="Mood signal" value={`${mood} / mix ${refreshNonce + 1}`} />
              {currentGeohash
                ? <Metric icon={<MapPinIcon className="size-5" />} label="Here with you" value={locationVisits > 1 ? `${locationVisits}× visited spot` : "New spot detected"} />
                : <Metric icon={<Squares2X2Icon className="size-5" />} label="Saved playlists" value={playlists.length || "Ready"} />}
            </div>
          </div>
          <QueuePanel queue={queue} onPlay={play} onRemove={removeFromQueue} />
        </section>

        {view === "discover" && (
          <>
            {loading && <Skeleton />}
            {sections.map((section) => (
              <SectionRail
                key={section.key}
                title={section.title}
                reason={section.reason}
                tracks={section.tracks}
                onPlay={play}
                onLike={like}
                onQueue={addToQueue}
                onExplore={!["recent", "favorites"].includes(section.key) ? () => explore(section) : undefined}
              />
            ))}
          </>
        )}

        {view === "search" && (
          <section className="mt-8">
            <form onSubmit={submitSearch} className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/35" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-white/12 bg-white/8 py-4 pl-12 pr-4 outline-none transition focus:border-pulse" placeholder="Search songs, artists, albums on iTunes" />
              </div>
              <button className="rounded-lg bg-pulse px-6 font-black text-ink hover:brightness-110">Search</button>
            </form>
            {loading && <Skeleton />}
            <TrackGrid tracks={searchResults} onPlay={play} onLike={like} onQueue={addToQueue} empty="Search real iTunes tracks and add them to your queue, favorites, or playlists." />
          </section>
        )}

        {view === "ai-playlists" && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="glass rounded-lg p-5">
              <h2 className="text-3xl font-black">AI Playlist Studio</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">Names and tracks are based on your actual plays, favorites, mood, and location context.</p>
              <button onClick={generateAiPlaylist} className="mt-5 w-full rounded-md bg-pulse px-4 py-3 font-black text-ink hover:brightness-110">
                Generate AI Playlist
              </button>
              {status && <p className="mt-4 rounded-md bg-white/8 px-4 py-3 text-sm text-aqua">{status}</p>}
            </div>
            <div>
              <h2 className="text-2xl font-black">Generated Now</h2>
              <TrackGrid tracks={generatedTracks} onPlay={play} onLike={like} onQueue={addToQueue} empty="Generate a playlist to see playable tracks here." />
            </div>
          </section>
        )}

        {view === "favorites" && (
          <section className="mt-8">
            <h2 className="text-3xl font-black">Favorites</h2>
            <TrackGrid tracks={favorites} onPlay={play} onLike={like} onQueue={addToQueue} empty="Tap the heart on any track to build your favorites." />
          </section>
        )}

        {view === "library" && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl font-black">Playlists</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 rounded-full bg-pulse px-4 py-2 text-sm font-black text-ink shadow-glow transition hover:brightness-110"
                  title="Create new playlist"
                >
                  <PlusIcon className="size-4" />
                  New Playlist
                </button>
              </div>
              {status && <p className="rounded-md bg-white/8 px-4 py-3 text-sm text-aqua">{status}</p>}
              {playlists.length === 0 && <div className="glass rounded-lg p-5 text-white/60">Hit <span className="font-black text-pulse">+ New Playlist</span> to create your first playlist, or generate an AI one from the AI Playlists tab.</div>}
              {playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => loadPlaylist(playlist)} className="glass block w-full rounded-lg p-5 text-left transition hover:border-pulse">
                  <p className="text-xs uppercase tracking-[0.18em] text-pulse">Playlist</p>
                  <h3 className="mt-2 text-2xl font-black">{playlist.name}</h3>
                  <p className="mt-2 text-sm text-white/55">{playlist.description || "Tap to load and play."}</p>
                </button>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-black">Playlist Tracks</h2>
              <TrackGrid tracks={libraryTracks} onPlay={play} onLike={like} onQueue={addToQueue} empty="Open a playlist to view and play its tracks." />
            </div>
          </section>
        )}

        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
          >
            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">New Playlist</h2>
                <button onClick={() => setShowCreateModal(false)} className="rounded-md p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-white/50">Give your playlist a name. You can add tracks from the Search page.</p>
              <form onSubmit={createManualPlaylist} className="mt-6 grid gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.18em] text-white/45">Name <span className="text-pulse">*</span></label>
                  <input
                    autoFocus
                    required
                    maxLength={160}
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g. Late Night Drives"
                    className="mt-2 w-full rounded-lg border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none transition focus:border-pulse placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.18em] text-white/45">Description <span className="text-white/30">(optional)</span></label>
                  <textarea
                    maxLength={300}
                    rows={2}
                    value={newPlaylistDesc}
                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                    placeholder="What's this playlist for?"
                    className="mt-2 w-full resize-none rounded-lg border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none transition focus:border-pulse placeholder:text-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || createLoading}
                  className="mt-2 w-full rounded-lg bg-pulse py-3 font-black text-ink shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {createLoading ? "Creating…" : "Create Playlist"}
                </button>
              </form>
            </div>
          </div>
        )}

        {view === "admin" && (
          user.is_admin ? <AdminPanel data={admin} /> : <div className="glass mt-8 rounded-lg p-8"><h2 className="text-3xl font-black">Admin access only</h2><p className="mt-2 text-white/58">Log in with the admin account to view platform analytics.</p></div>
        )}
      </div>
      <Player
        current={current}
        queue={queue}
        onEnded={handleEnded}
        onPrevious={playPrevious}
        onNext={nextTrack}
        onShuffleQueue={shuffleQueue}
        onLike={like}
        liked={!!(current && favorites.some((f) => f.itunes_track_id === current.itunes_track_id))}
      />
    </main>
  );
}

function routeToView(pathname: string): View {
  if (pathname === "/search") return "search";
  if (pathname === "/playlists") return "ai-playlists";
  if (pathname === "/favorites") return "favorites";
  if (pathname === "/library") return "library";
  if (pathname === "/admin") return "admin";
  return "discover";
}

function buildPlaylistName({ mood, activeLocation, recent, favorites, tracks }: { mood: string; activeLocation: string; recent: Song[]; favorites: Song[]; tracks: Song[] }) {
  const pool = [...recent, ...favorites, ...tracks];
  const artist = mostCommon(pool.map((track) => track.artist_name).filter(Boolean));
  const genre = mostCommon(pool.map((track) => track.genre || "").filter(Boolean));
  if (artist) return `${artist} ${mood} ${activeLocation} Mix`;
  if (genre) return `${mood} ${genre} Signal`;
  return `${mood} ${activeLocation} AI Mix`;
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function dedupeSongs(tracks: Song[]) {
  const seen = new Set<number>();
  return tracks.filter((track) => {
    if (seen.has(track.itunes_track_id)) return false;
    seen.add(track.itunes_track_id);
    return Boolean(track.preview_url);
  });
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function TrackGrid({ tracks, onPlay, onLike, onQueue, empty }: { tracks: Song[]; onPlay: (song: Song) => void; onLike: (song: Song) => void; onQueue: (song: Song) => void; empty: string }) {
  if (!tracks.length) return <div className="glass mt-4 rounded-lg p-6 text-sm text-white/58">{empty}</div>;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {tracks.map((track) => <TrackCard key={track.itunes_track_id} song={track} onPlay={onPlay} onLike={onLike} onQueue={onQueue} />)}
    </div>
  );
}

function QueuePanel({ queue, onPlay, onRemove }: { queue: Song[]; onPlay: (song: Song) => void; onRemove: (index: number) => void }) {
  return (
    <aside className="glass rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black"><QueueListIcon className="size-5 text-pulse" /> Up Next</h2>
        <span className="rounded-md bg-white/8 px-3 py-1 text-xs text-white/55">{queue.length} queued</span>
      </div>
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {queue.length === 0 && <p className="text-sm text-white/55">Queued songs will stay visible here while you move between pages.</p>}
        {queue.map((song, index) => (
          <div key={`${song.itunes_track_id}-${index}`} className="flex items-center gap-2 rounded-md bg-white/7 px-3 py-2">
            <button onClick={() => onPlay(song)} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-bold">{song.track_name}</span>
              <span className="block truncate text-xs text-white/48">{song.artist_name}</span>
            </button>
            <button onClick={() => onRemove(index)} className="rounded-md px-2 py-1 text-xs text-white/40 hover:bg-white/10 hover:text-coral">Remove</button>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Control({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-md border border-white/12 bg-black/45 px-3 py-3 text-sm outline-none focus:border-pulse">
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/24 p-4">
      <div className="flex items-center gap-2 text-pulse">{icon}<span className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{label}</span></div>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-lg bg-white/8" />)}
    </div>
  );
}
