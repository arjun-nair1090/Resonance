from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import LocationLog, User
from app.schemas.payloads import LocationTrackRequest, LocationTrackResponse

router = APIRouter()

_BUCKET = 0.002  # degrees ≈ 200 m


def _bucket(value: float) -> float:
    """Round a single coordinate component to the nearest bucket boundary."""
    return round(round(value / _BUCKET) * _BUCKET, 3)


def make_geohash(latitude: float, longitude: float) -> tuple[float, float, str]:
    """Return (lat_bucket, lng_bucket, geohash_string)."""
    lat_b = _bucket(latitude)
    lng_b = _bucket(longitude)
    return lat_b, lng_b, f"{lat_b:.3f}:{lng_b:.3f}"

@router.post("/track", response_model=LocationTrackResponse)
async def track_location(
    payload: LocationTrackRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> LocationTrackResponse:
    """
    Called by the browser every time a fresh GPS fix arrives.

    1. Converts raw lat/lng into a ~200 m bucket (geohash).
    2. Persists a LocationLog row so we accumulate visit frequency over time.
    3. Returns the current geohash, the user's overall most-visited geohash,
       and how many times they have been seen at the current bucket.
    """
    lat_b, lng_b, geohash = make_geohash(payload.latitude, payload.longitude)

    db.add(
        LocationLog(
            user_id=user.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            lat_bucket=lat_b,
            lng_bucket=lng_b,
            geohash=geohash,
        )
    )
    await db.commit()

    visit_result = await db.execute(
        select(func.count(LocationLog.id)).where(
            LocationLog.user_id == user.id,
            LocationLog.geohash == geohash,
        )
    )
    visit_count: int = visit_result.scalar_one() or 0

    freq_result = await db.execute(
        select(LocationLog.geohash, func.count(LocationLog.id).label("cnt"))
        .where(LocationLog.user_id == user.id, LocationLog.geohash.is_not(None))
        .group_by(LocationLog.geohash)
        .order_by(func.count(LocationLog.id).desc())
        .limit(1)
    )
    row = freq_result.first()
    frequent_geohash: str | None = row[0] if row else None

    return LocationTrackResponse(
        geohash=geohash,
        frequent_geohash=frequent_geohash,
        visit_count=visit_count,
    )
