import json
from urllib.parse import urlencode

import httpx
from redis.asyncio import Redis

from app.core.config import settings
from app.schemas.payloads import SongRead

ITUNES_URL = "https://itunes.apple.com/search"


def normalize_itunes_track(item: dict) -> SongRead | None:
    if item.get("wrapperType") != "track" or item.get("kind") != "song":
        return None
    track_id = item.get("trackId")
    if not track_id:
        return None
    artwork = item.get("artworkUrl100")
    if artwork:
        artwork = artwork.replace("100x100bb", "600x600bb")
    return SongRead(
        itunes_track_id=int(track_id),
        track_name=item.get("trackName", "Unknown Track"),
        artist_name=item.get("artistName", "Unknown Artist"),
        album_name=item.get("collectionName"),
        genre=item.get("primaryGenreName"),
        preview_url=item.get("previewUrl"),
        artwork_url=artwork,
        release_date=item.get("releaseDate"),
        duration_ms=item.get("trackTimeMillis"),
        metadata={
            "collection_id": item.get("collectionId"),
            "track_price": item.get("trackPrice"),
            "currency": item.get("currency"),
            "country": item.get("country"),
            "artist_view_url": item.get("artistViewUrl"),
            "collection_view_url": item.get("collectionViewUrl"),
            "track_view_url": item.get("trackViewUrl"),
        },
    )


async def search_itunes(
    query: str,
    redis: Redis | None = None,
    country: str | None = None,
    limit: int = 24,
) -> list[SongRead]:
    country = country or settings.itunes_country
    params = {
        "term": query,
        "entity": "song",
        "media": "music",
        "country": country,
        "limit": limit,
    }
    cache_key = f"itunes:{urlencode(params)}"
    if redis:
        cached = await redis.get(cache_key)
        if cached:
            return [SongRead(**row) for row in json.loads(cached)]

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(ITUNES_URL, params=params)
        response.raise_for_status()
    tracks = [track for item in response.json().get("results", []) if (track := normalize_itunes_track(item))]

    if redis:
        await redis.setex(cache_key, 60 * 60, json.dumps([track.model_dump() for track in tracks]))
    return tracks
