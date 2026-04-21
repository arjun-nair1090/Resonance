from datetime import datetime

from fastapi import APIRouter, Depends, Query
from redis.asyncio import Redis
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Analytics, Favorite, ListeningHistory, MoodLog, Song, User
from app.schemas.payloads import SongRead, TrackEvent
from app.services.cache import get_redis
from app.services.catalog import to_song_read, upsert_song
from app.services.itunes import search_itunes

router = APIRouter()


@router.get("/search", response_model=list[SongRead])
async def search(
    q: str = Query(min_length=2),
    country: str | None = None,
    redis: Redis = Depends(get_redis),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[SongRead]:
    tracks = await search_itunes(q, redis=redis, country=country or user.country or "US")
    for track in tracks[:10]:
        await upsert_song(db, track)
    db.add(Analytics(event_name="search", user_id=user.id, properties={"query": q}))
    await db.commit()
    return tracks


@router.post("/events")
async def track_event(
    payload: TrackEvent,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    song_payload = payload.song or SongRead(
        itunes_track_id=payload.itunes_track_id,
        track_name="Unknown Track",
        artist_name="Unknown Artist",
    )
    song = await upsert_song(db, song_payload)
    now = datetime.now()
    db.add(
        ListeningHistory(
            user_id=user.id,
            song_id=song.id,
            action=payload.action,
            mood=payload.mood,
            city=payload.city or user.city,
            hour_of_day=now.hour,
            session_id=payload.session_id,
            geohash=payload.geohash,   # micro-location bucket at time of play
            context=payload.context,
        )
    )
    if payload.mood:
        db.add(MoodLog(user_id=user.id, mood=payload.mood))
    if payload.action in {"favorite", "like"}:
        exists = await db.execute(select(Favorite).where(Favorite.user_id == user.id, Favorite.song_id == song.id))
        if not exists.scalar_one_or_none():
            db.add(Favorite(user_id=user.id, song_id=song.id))
    if payload.action == "dislike":
        await db.execute(delete(Favorite).where(Favorite.user_id == user.id, Favorite.song_id == song.id))
    db.add(
        Analytics(
            event_name=payload.action,
            user_id=user.id,
            song_id=song.id,
            city=payload.city or user.city,
            mood=payload.mood,
            properties=payload.context,
        )
    )
    await db.commit()
    return {"status": "recorded"}


@router.get("/favorites", response_model=list[SongRead])
async def favorites(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[SongRead]:
    result = await db.execute(select(Song).join(Favorite, Favorite.song_id == Song.id).where(Favorite.user_id == user.id))
    return [to_song_read(song) for song in result.scalars()]


@router.get("/recent", response_model=list[SongRead])
async def recent(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[SongRead]:
    result = await db.execute(
        select(Song)
        .join(ListeningHistory, ListeningHistory.song_id == Song.id)
        .where(ListeningHistory.user_id == user.id)
        .order_by(ListeningHistory.created_at.desc())
        .limit(20)
    )
    return [to_song_read(song) for song in result.scalars().unique()]
