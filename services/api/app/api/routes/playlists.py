from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Analytics, Playlist, PlaylistMember, PlaylistSong, Song, User
from app.schemas.payloads import PlaylistCreate, PlaylistRead, SongRead
from app.services.catalog import to_song_read, upsert_song

router = APIRouter()


@router.post("", response_model=PlaylistRead)
async def create_playlist(
    payload: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PlaylistRead:
    playlist = Playlist(owner_id=user.id, **payload.model_dump())
    db.add(playlist)
    await db.flush()
    db.add(PlaylistMember(playlist_id=playlist.id, user_id=user.id, role="owner"))
    db.add(Analytics(event_name="playlist_created", user_id=user.id, playlist_id=playlist.id))
    await db.commit()
    await db.refresh(playlist)
    return PlaylistRead.model_validate(playlist)


@router.get("", response_model=list[PlaylistRead])
async def my_playlists(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[PlaylistRead]:
    result = await db.execute(
        select(Playlist).join(PlaylistMember, PlaylistMember.playlist_id == Playlist.id).where(PlaylistMember.user_id == user.id)
    )
    return [PlaylistRead.model_validate(row) for row in result.scalars()]


@router.post("/{playlist_id}/tracks")
async def add_track(
    playlist_id: str,
    payload: SongRead,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    member = await db.execute(
        select(PlaylistMember).where(PlaylistMember.playlist_id == playlist_id, PlaylistMember.user_id == user.id)
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a playlist collaborator")
    song = await upsert_song(db, payload)
    exists = await db.execute(select(PlaylistSong).where(PlaylistSong.playlist_id == playlist_id, PlaylistSong.song_id == song.id))
    if not exists.scalar_one_or_none():
        db.add(PlaylistSong(playlist_id=playlist_id, song_id=song.id, added_by_id=user.id))
    db.add(Analytics(event_name="playlist_track_added", user_id=user.id, song_id=song.id, playlist_id=playlist_id))
    await db.commit()
    return {"status": "added"}


@router.get("/{playlist_id}/tracks", response_model=list[SongRead])
async def playlist_tracks(playlist_id: str, db: AsyncSession = Depends(get_db)) -> list[SongRead]:
    result = await db.execute(select(Song).join(PlaylistSong, PlaylistSong.song_id == Song.id).where(PlaylistSong.playlist_id == playlist_id))
    return [to_song_read(song) for song in result.scalars()]


@router.post("/{playlist_id}/members/{user_id}")
async def add_member(
    playlist_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    playlist = await db.get(Playlist, playlist_id)
    if not playlist or playlist.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can add collaborators")
    db.add(PlaylistMember(playlist_id=playlist_id, user_id=user_id, role="editor"))
    await db.commit()
    return {"status": "collaborator_added"}
