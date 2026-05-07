from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.base import Base
from app.db.models import Turf
from app.db.session import SessionLocal, engine
from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.health.router import router as health_router
from app.modules.turfs.router import router as turfs_router

settings = get_settings()
setup_logging()

app = FastAPI(title=settings.app_name, debug=settings.debug)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.scalar(select(Turf.id).limit(1))
        if existing is None:
            db.add_all(
                [
                    Turf(
                        name="Arena 7",
                        city="Pune",
                        address="Baner",
                        price_per_hour=1200,
                        rating=4.7,
                        is_popular=True,
                        is_nearby=True,
                    ),
                    Turf(
                        name="Night Strikers",
                        city="Pune",
                        address="Wakad",
                        price_per_hour=1000,
                        rating=4.4,
                    ),
                ]
            )
            db.commit()
    finally:
        db.close()


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid4()))
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "error": str(exc)})


app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(turfs_router, prefix=settings.api_prefix)
app.include_router(bookings_router, prefix=settings.api_prefix)
