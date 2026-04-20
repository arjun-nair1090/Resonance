from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from random import random
import re

import numpy as np
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Favorite, ListeningHistory, Song
from app.schemas.payloads import RecommendationRequest, SongRead
from app.services.itunes import search_itunes

MOOD_CLUSTERS = {
    "happy": [
        ["Dua Lipa levitating", "Bruno Mars 24K Magic", "Calvin Harris feels"],
        ["Justin Timberlake cant stop the feeling", "Katy Perry firework", "Walk The Moon shut up and dance"],
        ["Beyonce cuff it", "Harry Styles golden", "Lizzo about damn time"],
        ["Disclosure latch", "Jungle keep moving", "Chromeo jealousy"],
    ],
    "sad": [
        ["Adele ballads", "Billie Eilish acoustic", "Frank Ocean"],
        ["Phoebe Bridgers", "Lewis Capaldi", "Sam Smith heartbreak"],
        ["Lana Del Rey melancholia", "Joji", "The National"],
        ["Daughter", "Bon Iver sad", "Kehlani emotional"],
    ],
    "gym": [
        ["David Guetta", "Eminem workout", "Skrillex"],
        ["Kanye West power", "Travis Scott hype", "Migos energy"],
        ["Martin Garrix", "Swedish House Mafia", "The Prodigy"],
        ["Drake energy", "Future workout", "Meek Mill"],
    ],
    "party": [
        ["Bad Bunny dance", "Rihanna club", "Black Eyed Peas"],
        ["Pitbull party", "J Balvin", "Major Lazer"],
        ["Doja Cat party", "Charli xcx", "Fisher dance"],
        ["Shakira dance", "Sean Paul", "Burna Boy party"],
    ],
    "relaxed": [
        ["Jack Johnson acoustic", "Bonobo", "Norah Jones"],
        ["Khruangbin", "Men I Trust", "Tom Misch"],
        ["Petit Biscuit", "FKJ", "Masego mellow"],
        ["Cigarettes After Sex calm", "Lianne La Havas", "Yebba"],
    ],
    "romantic": [
        ["SZA r&b", "John Legend", "Daniel Caesar"],
        ["Alicia Keys love", "Giveon", "Jhene Aiko"],
        ["Miguel slow jam", "Sade", "The Internet"],
        ["Masego romantic", "H.E.R.", "Mac Ayres"],
    ],
    "focus": [
        ["Hans Zimmer", "Ludovico Einaudi", "Tycho"],
        ["Nils Frahm", "Ólafur Arnalds", "Max Richter"],
        ["Emancipator", "Boards of Canada", "Kiasmos"],
        ["Lo-fi study", "Jazzhop focus", "Chillhop essentials"],
    ],
    "angry": [
        ["Linkin Park", "Metallica", "Bring Me The Horizon"],
        ["System Of A Down", "Slipknot", "Papa Roach"],
        ["Rage Against The Machine", "Limp Bizkit", "Deftones"],
        ["Run The Jewels", "Denzel Curry", "Scarlxrd"],
    ],
}

TIME_CLUSTERS = {
    "morning": [
        ["Norah Jones", "Jack Johnson acoustic", "Yiruma piano"],
        ["Coldplay sunrise", "Corinne Bailey Rae", "John Mayer acoustic"],
        ["Kacey Musgraves golden hour", "Ben Rector", "Sara Bareilles"],
        ["Acoustic morning", "Indie folk sunrise", "Coffeehouse classics"],
    ],
    "afternoon": [
        ["Tycho", "Tame Impala", "ODESZA"],
        ["Parcels", "Phoenix", "Empire of the Sun"],
        ["Anderson .Paak groove", "Toro y Moi", "SG Lewis"],
        ["Focus pop", "Indie electronic afternoon", "Alternative groove"],
    ],
    "evening": [
        ["SZA r&b", "Khalid", "Cigarettes After Sex"],
        ["The xx", "Majid Jordan", "The Japanese House"],
        ["Rhye", "Snoh Aalegra", "M83 sunset"],
        ["Evening lounge", "Late drive", "Soft alt r&b"],
    ],
    "night": [
        ["The Weeknd after hours", "Bonobo", "Nils Frahm"],
        ["James Blake", "Massive Attack", "Portishead"],
        ["After dark synthwave", "Nocturnal r&b", "Deep night electronic"],
        ["Night drive", "Lo-fi night", "Midnight soul"],
    ],
}

CITY_CLUSTERS = {
    "city": [
        ["Drake", "Dua Lipa", "The Weeknd"],
        ["Metro Boomin", "Fred again..", "Raye"],
        ["Pop hits", "Urban nights", "Global chart"],
    ],
    "beach": [
        ["Kygo tropical", "Calvin Harris summer", "Bob Marley"],
        ["Tropical house", "Reggae beach", "Poolside"],
        ["Sofi Tukker", "Petit Biscuit summer", "Whethan coast"],
    ],
    "mountains": [
        ["Bon Iver", "Fleet Foxes", "Novo Amor"],
        ["Ben Howard", "Hollow Coves", "Lord Huron"],
        ["Indie folk escape", "Cinematic wilderness", "Mountain calm"],
    ],
    "commute": [
        ["Tame Impala", "Post Malone", "The 1975"],
        ["Fred again..", "The Neighbourhood", "Glass Animals"],
        ["Late commute", "City headphones", "Alternative drive"],
    ],
    "campus": [
        ["Taylor Swift", "Olivia Rodrigo", "Arctic Monkeys"],
        ["Phoebe Bridgers", "The Strokes", "beabadoobee"],
        ["Campus pop", "Indie favorites", "Study break mix"],
    ],
    "mumbai": [
        ["bollywood", "punjabi hits", "indian pop"],
        ["arijit singh", "pritam", "shreya ghoshal"],
        ["indian trending", "hindi essentials", "desi pop"],
    ],
    "delhi": [
        ["bollywood", "punjabi", "hindi hits"],
        ["badshah", "diljit dosanjh", "armaan malik"],
        ["indian rap", "desi urban", "hindi pop"],
    ],
    "seoul": [
        ["k-pop", "korean pop", "korean r&b"],
        ["newjeans", "bts", "dean"],
        ["seoul night drive", "k-indie", "k-rnb essentials"],
    ],
    "new york": [
        ["hip hop", "pop hits", "r&b"],
        ["jay-z", "kendrick lamar", "sza"],
        ["brooklyn indie", "nyc rap", "downtown pop"],
    ],
    "tokyo": [
        ["j-pop", "anime songs", "city pop"],
        ["hikaru utada", "yoasobi", "mariya takeuchi"],
        ["tokyo night", "japanese indie", "city pop essentials"],
    ],
    "london": [
        ["uk pop", "uk rap", "indie rock"],
        ["stormzy", "dua lipa", "the 1975"],
        ["london electronic", "british soul", "uk alt"],
    ],
}

HIDDEN_CLUSTERS = [
    ["underrated indie electronic", "alternative deep cuts", "neo soul hidden gems"],
    ["leftfield pop gems", "indie r&b discoveries", "downtempo hidden gems"],
    ["dream pop hidden gems", "bedroom pop underrated", "soul deep cuts"],
]

DISCOVER_CLUSTERS = [
    ["discover weekly", "fresh finds", "new music friday"],
    ["indie discoveries", "global breakout songs", "next wave pop"],
    ["alternative discovery", "future beats", "new artists to watch"],
]

WORKOUT_CLUSTERS = [
    ["David Guetta", "Eminem workout", "Skrillex"],
    ["Swedish House Mafia", "Future workout", "Martin Garrix"],
    ["Run the Jewels", "Burna Boy energy", "Migos workout"],
]


@dataclass
class ScoredSong:
    song: SongRead
    score: float


def daypart(hour: int | None = None) -> str:
    hour = datetime.now().hour if hour is None else hour
    if 5 <= hour < 12:
        return "morning"
    if 12 <= hour < 17:
        return "afternoon"
    if 17 <= hour < 22:
        return "evening"
    return "night"


class HybridRecommendationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def sections(self, user_id: str, request: RecommendationRequest, redis=None) -> list[dict]:
        period = daypart()
        city = (request.city or "").lower()
        mood = (request.mood or "").lower()
        rotation = max(request.refresh_nonce, 0)
        # Precompute user profile once — used by every section's ranking and seeding.
        user_artists = await self._user_artists(user_id)   # ordered list: top artists by plays+likes
        user_genres = await self._user_genres(user_id)     # set for O(1) membership checks
        artist_queries = self._build_artist_queries(user_artists, rotation)
        recommended_queries = self._build_recommended_queries(user_artists, user_genres, mood, city, rotation)

        definitions = [
            ("Recommended For You", "recommended", recommended_queries, "Your listening history, likes, and recent actions reshape this mix after every click."),
            ("Based On Your Mood", "mood", self._window(MOOD_CLUSTERS.get(mood), rotation, ["feel good music", "uplifting pop", "dance favorites"]), f"Tuned for {request.mood or 'your current'} mood with a fresh candidate pool each refresh."),
            (f"{period.title()} Picks", "time", self._window(TIME_CLUSTERS.get(period), rotation, ["morning acoustic", "sunrise songs", "soft focus"]), "Time-aware ranking learns your routine and rotates the candidates."),
            ("Night Vibes", "night", self._window(TIME_CLUSTERS["night"], rotation + 1, ["night drive", "late night r&b", "midnight electronic"]), "Late-night listening with softer discovery."),
            ("Because You Like Artists", "artist", artist_queries, "Built from the artists you have actually listened to recently and liked most."),
            ("Hidden Gems", "hidden", self._window(HIDDEN_CLUSTERS, rotation, ["hidden gems", "underrated songs", "deep cuts"]), "Lower mainstream bias with fresh discovery."),
            ("Discover Weekly", "discover", self._window(DISCOVER_CLUSTERS, rotation, ["discover weekly", "fresh finds", "new music"]), "A balanced exploration mix that rerolls cleanly."),
            ("Smart Workout Playlists", "workout", self._window(WORKOUT_CLUSTERS, rotation, ["workout hits", "gym music", "high energy mix"]), "High-energy tracks for movement."),
        ]

        payload = []
        for title, key, queries, reason in definitions:
            tracks = await self._collect_tracks(queries, redis=redis, limit=request.limit)
            # Pass precomputed profile so _rank never hits the DB again.
            ranked = await self._rank(tracks, mood=mood, city=city, period=period,
                                      user_artists=user_artists, user_genres=user_genres)
            payload.append({"title": title, "key": key, "tracks": [item.song for item in ranked], "reason": reason})
        return payload

    async def _collect_tracks(self, queries: list[str], redis=None, limit: int = 12) -> list[SongRead]:
        collected: list[SongRead] = []
        seen_ids: set[int] = set()
        seen_names: set[tuple[str, str]] = set()
        per_query_limit = max(8, min(16, limit + 2))
        for query in queries[:6]:
            tracks = await search_itunes(query, redis=redis, limit=per_query_limit)
            for track in tracks:
                name_key = (self._canonical_name(track.track_name), track.artist_name.lower())
                if track.itunes_track_id in seen_ids or name_key in seen_names or not track.preview_url:
                    continue
                seen_ids.add(track.itunes_track_id)
                seen_names.add(name_key)
                collected.append(track)
                if len(collected) >= limit * 3:
                    return collected
        return collected

    async def _rank(
        self,
        tracks: list[SongRead],
        mood: str,
        city: str,
        period: str,
        user_artists: list[str] | None = None,
        user_genres: set[str] | None = None,
    ) -> list[ScoredSong]:
        # Accept precomputed profile data to avoid redundant DB queries per section.
        artists_set: set[str] = set(user_artists) if user_artists else set()
        genres_set: set[str] = user_genres if user_genres is not None else set()
        results: list[ScoredSong] = []
        for index, track in enumerate(tracks):
            score = 0.42
            if track.genre and track.genre.lower() in genres_set:
                score += 0.2
            if track.artist_name.lower() in artists_set:
                score += 0.22
            score += self._mood_score(track, mood)
            score += self._time_score(track, period)
            score += self._location_score(track, city)
            score += max(0, 0.1 - index * 0.003)
            score += random() * 0.025
            results.append(ScoredSong(song=track, score=float(np.clip(score, 0, 1))))
        return sorted(results, key=lambda item: item.score, reverse=True)

    @staticmethod
    def _build_recommended_queries(
        user_artists: list[str],
        user_genres: set[str],
        mood: str,
        city: str,
        rotation: int,
    ) -> list[str]:
        """Build personalized seed queries for the 'Recommended For You' section.

        user_artists is an *ordered* list (top artists by plays+likes first),
        which guarantees the most-played artists anchor the primary seed queries.
        """
        queries: list[str] = []
        # Primary seeds: the user's top 3 artists drive this section.
        queries.extend([f"{artist} similar artists" for artist in user_artists[:3]])
        # Secondary seeds: genre affinity broadens discovery.
        queries.extend([f"{genre} essentials" for genre in list(user_genres)[:2]])
        # Tertiary seeds: mood and city clusters fill the pool.
        queries.extend(HybridRecommendationEngine._window(MOOD_CLUSTERS.get(mood), rotation, []))
        queries.extend(HybridRecommendationEngine._window(CITY_CLUSTERS.get(city), rotation, []))
        return HybridRecommendationEngine._unique(queries) or ["top songs", "global hits", "discover weekly"]

    @staticmethod
    def _build_artist_queries(user_artists: list[str], rotation: int) -> list[str]:
        """Build seed queries for the 'Because You Like Artists' section.

        user_artists is an *ordered* list so rotation offsets predictably cycle
        through the user's actual top artists, not a random permutation.
        """
        if not user_artists:
            return ["discover weekly", "artist essentials", "fresh finds"]
        offset = rotation % len(user_artists)
        ordered = user_artists[offset:] + user_artists[:offset]
        queries = [f"{artist} essentials" for artist in ordered[:5]]
        queries.extend([f"{artist} deep cuts" for artist in ordered[:3]])
        return queries

    async def _user_genres(self, user_id: str) -> set[str]:
        result = await self.db.execute(
            select(Song.genre)
            .join(ListeningHistory, ListeningHistory.song_id == Song.id)
            .where(ListeningHistory.user_id == user_id, Song.genre.is_not(None))
            .group_by(Song.genre)
            .order_by(desc(func.count(ListeningHistory.id)))
            .limit(10)
        )
        return {row[0].lower() for row in result if row[0]}

    async def _user_artists(self, user_id: str) -> list[str]:
        """Return artists ordered by engagement (plays + likes) descending.

        Returns a *list* (not a set) to preserve SQL ORDER BY, ensuring the
        most-listened artists consistently anchor the recommendation seed queries.
        """
        result = await self.db.execute(
            select(Song.artist_name)
            .outerjoin(ListeningHistory, ListeningHistory.song_id == Song.id)
            .outerjoin(Favorite, Favorite.song_id == Song.id)
            .where((ListeningHistory.user_id == user_id) | (Favorite.user_id == user_id))
            .group_by(Song.artist_name)
            .order_by(desc(func.count(ListeningHistory.id) + func.count(Favorite.id)))
            .limit(12)
        )
        return [row[0].lower() for row in result if row[0]]

    @staticmethod
    def _window(clusters: list[list[str]] | None, rotation: int, fallback: list[str]) -> list[str]:
        if not clusters:
            return fallback
        index = rotation % len(clusters)
        ordered = clusters[index:] + clusters[:index]
        values: list[str] = []
        for cluster in ordered[:2]:
            values.extend(cluster)
        return values

    @staticmethod
    def _unique(values: list[str]) -> list[str]:
        seen: set[str] = set()
        ordered: list[str] = []
        for value in values:
            normalized = value.lower().strip()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            ordered.append(value)
        return ordered

    @staticmethod
    def _canonical_name(value: str) -> str:
        normalized = value.lower()
        normalized = re.sub(r"\s*\(.*?\)", "", normalized)
        normalized = normalized.split(" - ")[0]
        return normalized.strip()

    @staticmethod
    def _mood_score(track: SongRead, mood: str) -> float:
        text = f"{track.track_name} {track.artist_name} {track.genre or ''}".lower()
        clusters = MOOD_CLUSTERS.get(mood, [])
        return 0.13 if any(token in text for query in sum(clusters, []) for token in query.split()) else 0.0

    @staticmethod
    def _time_score(track: SongRead, period: str) -> float:
        text = f"{track.track_name} {track.artist_name} {track.genre or ''}".lower()
        return 0.08 if any(token in text for query in sum(TIME_CLUSTERS[period], []) for token in query.split()) else 0.02

    @staticmethod
    def _location_score(track: SongRead, city: str) -> float:
        if not city:
            return 0.0
        text = f"{track.track_name} {track.artist_name} {track.genre or ''}".lower()
        return 0.09 if any(token in text for query in sum(CITY_CLUSTERS.get(city, []), []) for token in query.split()) else 0.0
