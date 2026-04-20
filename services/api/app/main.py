from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.api.routes import admin, auth, music, playlists, recommendations, social
from app.core.config import settings
from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models.entities import User

app = FastAPI(
    title="Resonance AI Music API",
    version="1.0.0",
    description="FastAPI backend for AI-powered music recommendations using iTunes previews.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(music.router, prefix="/music", tags=["music"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
app.include_router(social.router, prefix="/social", tags=["social"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.on_event("startup")
async def seed_admin_user() -> None:
    async with SessionLocal() as db:
        await db.execute(text("ALTER TABLE songs ALTER COLUMN itunes_track_id TYPE BIGINT"))
        await db.commit()
        result = await db.execute(select(User).where(User.email == "admin@resonance.ai"))
        if result.scalar_one_or_none():
            return
        db.add(
            User(
                email="admin@resonance.ai",
                display_name="Resonance Admin",
                password_hash=hash_password("admin12345"),
                city="Mumbai",
                country="IN",
                is_admin=True,
            )
        )
        await db.commit()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "resonance-api"}
