from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=2, max_length=120)
    city: str | None = None
    country: str | None = "US"


class UserRead(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    city: str | None = None
    country: str | None = None
    is_admin: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class SongRead(BaseModel):
    id: str | None = None
    itunes_track_id: int
    track_name: str
    artist_name: str
    album_name: str | None = None
    genre: str | None = None
    preview_url: str | None = None
    artwork_url: str | None = None
    release_date: str | None = None
    duration_ms: int | None = None
    metadata: dict = Field(default_factory=dict)

    class Config:
        from_attributes = True


class TrackEvent(BaseModel):
    itunes_track_id: int
    action: str = Field(pattern="^(play|skip|replay|favorite|like|dislike|search|save|complete)$")
    mood: str | None = None
    city: str | None = None
    geohash: str | None = None   # micro-location bucket forwarded from the browser GPS ping
    session_id: str | None = None
    context: dict = {}
    song: SongRead | None = None


class RecommendationRequest(BaseModel):
    mood: str | None = None
    city: str | None = None
    geohash: str | None = None   # current micro-location bucket; drives location-aware seeding
    refresh_nonce: int = 0
    limit: int = Field(default=12, ge=1, le=40)


class RecommendationSection(BaseModel):
    title: str
    key: str
    tracks: list[SongRead]
    reason: str


class PlaylistCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str | None = None
    is_public: bool = False


class PlaylistRead(BaseModel):
    id: str
    name: str
    description: str | None
    is_public: bool
    share_slug: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Location tracking
# ---------------------------------------------------------------------------

class LocationTrackRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class LocationTrackResponse(BaseModel):
    geohash: str                    # "lat_bucket:lng_bucket" key for this visit
    frequent_geohash: str | None = None   # user's single most-visited bucket overall
    visit_count: int                # how many times the user has been logged at this exact bucket
