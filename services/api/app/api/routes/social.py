from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import FriendActivity, User

router = APIRouter()


@router.get("/activity")
async def activity_feed(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[dict]:
    result = await db.execute(
        select(FriendActivity).where(FriendActivity.user_id == user.id).order_by(FriendActivity.created_at.desc()).limit(30)
    )
    return [
        {
            "id": item.id,
            "actor": item.actor_name,
            "action": item.action,
            "metadata": item.metadata_json,
            "created_at": item.created_at,
        }
        for item in result.scalars()
    ]


@router.post("/share")
async def share(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    db.add(
        FriendActivity(
            user_id=user.id,
            actor_name=user.display_name,
            action=payload.get("action", "shared a track"),
            song_id=payload.get("song_id"),
            metadata_json=payload,
        )
    )
    await db.commit()
    return {"status": "shared"}
