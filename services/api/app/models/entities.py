from datetime import datetime
from uuid import uuid4

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def uuid_pk() -> Mapped[str]:
    return mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = uuid_pk()
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(2))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


class Song(Base, TimestampMixin):
    __tablename__ = "songs"

    id: Mapped[str] = uuid_pk()
    itunes_track_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    track_name: Mapped[str] = mapped_column(String(255), index=True)
    artist_name: Mapped[str] = mapped_column(String(255), index=True)
    album_name: Mapped[str | None] = mapped_column(String(255))
    genre: Mapped[str | None] = mapped_column(String(120), index=True)
    preview_url: Mapped[str | None] = mapped_column(Text)
    artwork_url: Mapped[str | None] = mapped_column(Text)
    release_date: Mapped[str | None] = mapped_column(String(64))
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)


class ListeningHistory(Base, TimestampMixin):
    __tablename__ = "listening_history"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"), index=True)
    action: Mapped[str] = mapped_column(String(30), index=True)
    mood: Mapped[str | None] = mapped_column(String(40), index=True)
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    hour_of_day: Mapped[int] = mapped_column(Integer, index=True)
    session_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), index=True)
    context: Mapped[dict] = mapped_column(JSONB, default=dict)


class Favorite(Base, TimestampMixin):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "song_id", name="uq_favorite_user_song"),)

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"), index=True)


class Playlist(Base, TimestampMixin):
    __tablename__ = "playlists"

    id: Mapped[str] = uuid_pk()
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, default=lambda: uuid4().hex[:12])


class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    __table_args__ = (UniqueConstraint("playlist_id", "song_id", name="uq_playlist_song"),)

    playlist_id: Mapped[str] = mapped_column(ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    added_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PlaylistMember(Base, TimestampMixin):
    __tablename__ = "playlist_members"
    __table_args__ = (UniqueConstraint("playlist_id", "user_id", name="uq_playlist_member"),)

    id: Mapped[str] = uuid_pk()
    playlist_id: Mapped[str] = mapped_column(ForeignKey("playlists.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(30), default="editor")


class MoodLog(Base, TimestampMixin):
    __tablename__ = "mood_logs"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mood: Mapped[str] = mapped_column(String(40), index=True)


class LocationLog(Base, TimestampMixin):
    __tablename__ = "location_logs"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    country: Mapped[str | None] = mapped_column(String(2), index=True)
    ip_hash: Mapped[str | None] = mapped_column(String(128))


class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.id", ondelete="CASCADE"), index=True)
    section: Mapped[str] = mapped_column(String(80), index=True)
    score: Mapped[float] = mapped_column(Numeric(7, 4))
    reasons: Mapped[dict] = mapped_column(JSONB, default=dict)


class Session(Base, TimestampMixin):
    __tablename__ = "sessions"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    device: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))


class Analytics(Base, TimestampMixin):
    __tablename__ = "analytics"

    id: Mapped[str] = uuid_pk()
    event_name: Mapped[str] = mapped_column(String(80), index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    song_id: Mapped[str | None] = mapped_column(ForeignKey("songs.id", ondelete="SET NULL"), index=True)
    playlist_id: Mapped[str | None] = mapped_column(ForeignKey("playlists.id", ondelete="SET NULL"), index=True)
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    mood: Mapped[str | None] = mapped_column(String(40), index=True)
    value: Mapped[float | None] = mapped_column(Numeric(12, 4))
    properties: Mapped[dict] = mapped_column(JSONB, default=dict)


class FriendActivity(Base, TimestampMixin):
    __tablename__ = "friend_activity"

    id: Mapped[str] = uuid_pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    actor_name: Mapped[str] = mapped_column(String(120))
    action: Mapped[str] = mapped_column(String(80))
    song_id: Mapped[str | None] = mapped_column(ForeignKey("songs.id", ondelete="SET NULL"))
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
