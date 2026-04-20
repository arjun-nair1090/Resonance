from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Analytics, ListeningHistory, MoodLog, Playlist, Song, User

router = APIRouter()


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> dict:
    total_users = await db.scalar(select(func.count(User.id)))
    active_users = await db.scalar(select(func.count(func.distinct(ListeningHistory.user_id))))
    playlists = await db.scalar(select(func.count(Playlist.id)))

    most_played = await db.execute(
        select(Song.track_name, Song.artist_name, func.count(ListeningHistory.id).label("plays"))
        .join(ListeningHistory, ListeningHistory.song_id == Song.id)
        .where(ListeningHistory.action.in_(["play", "replay", "complete"]))
        .group_by(Song.track_name, Song.artist_name)
        .order_by(desc("plays"))
        .limit(10)
    )
    most_skipped = await db.execute(
        select(Song.track_name, Song.artist_name, func.count(ListeningHistory.id).label("skips"))
        .join(ListeningHistory, ListeningHistory.song_id == Song.id)
        .where(ListeningHistory.action == "skip")
        .group_by(Song.track_name, Song.artist_name)
        .order_by(desc("skips"))
        .limit(10)
    )
    moods = await db.execute(
        select(MoodLog.mood, func.count(MoodLog.id).label("count")).group_by(MoodLog.mood).order_by(desc("count")).limit(8)
    )
    regions = await db.execute(
        select(ListeningHistory.city, func.count(ListeningHistory.id).label("count"))
        .where(ListeningHistory.city.is_not(None))
        .group_by(ListeningHistory.city)
        .order_by(desc("count"))
        .limit(10)
    )
    ctr_clicks = await db.scalar(select(func.count(Analytics.id)).where(Analytics.event_name == "recommendation_click"))
    ctr_views = await db.scalar(select(func.count(Analytics.id)).where(Analytics.event_name == "recommendation_request"))

    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "playlist_creation_stats": playlists or 0,
        "recommendation_ctr": round((ctr_clicks or 0) / max(ctr_views or 1, 1), 4),
        "most_played_songs": [{"track": r[0], "artist": r[1], "plays": r[2]} for r in most_played],
        "most_skipped_songs": [{"track": r[0], "artist": r[1], "skips": r[2]} for r in most_skipped],
        "top_moods_selected": [{"mood": r[0], "count": r[1]} for r in moods],
        "region_trends": [{"city": r[0], "count": r[1]} for r in regions],
    }
