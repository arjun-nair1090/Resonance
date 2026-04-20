from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Song
from app.schemas.payloads import SongRead


async def upsert_song(db: AsyncSession, payload: SongRead) -> Song:
    result = await db.execute(select(Song).where(Song.itunes_track_id == payload.itunes_track_id))
    song = result.scalar_one_or_none()
    if song is None:
        data = payload.model_dump(exclude={"id", "metadata"})
        song = Song(**data, metadata_json=payload.metadata)
        db.add(song)
    else:
        for key, value in payload.model_dump(exclude={"id", "metadata"}).items():
            setattr(song, key, value)
        song.metadata_json = payload.metadata
    await db.flush()
    return song


def to_song_read(song: Song) -> SongRead:
    return SongRead(
        id=song.id,
        itunes_track_id=song.itunes_track_id,
        track_name=song.track_name,
        artist_name=song.artist_name,
        album_name=song.album_name,
        genre=song.genre,
        preview_url=song.preview_url,
        artwork_url=song.artwork_url,
        release_date=song.release_date,
        duration_ms=song.duration_ms,
        metadata=song.metadata_json or {},
    )
