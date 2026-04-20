from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Analytics, User
from app.recommender.engine import HybridRecommendationEngine
from app.schemas.payloads import RecommendationRequest
from app.services.cache import get_redis

router = APIRouter()


@router.post("")
async def recommendations(
    payload: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    user: User = Depends(get_current_user),
) -> list[dict]:
    engine = HybridRecommendationEngine(db)
    sections = await engine.sections(user.id, payload, redis=redis)
    db.add(
        Analytics(
            event_name="recommendation_request",
            user_id=user.id,
            city=payload.city or user.city,
            mood=payload.mood,
            properties={"refresh_nonce": payload.refresh_nonce},
        )
    )
    await db.commit()
    return sections
