from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.models import Booking, Turf
from app.db.session import get_db
from fastapi import Depends

router = APIRouter(prefix="/turfs", tags=["turfs"])


class TurfOut(BaseModel):
    id: str
    name: str
    city: str
    address: str
    price_per_hour: int
    rating: float
    is_popular: bool = False
    is_nearby: bool = False


@router.get("", response_model=list[TurfOut])
def list_turfs(
    q: str | None = Query(default=None),
    city: str | None = Query(default=None),
    popular: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> list[TurfOut]:
    query = select(Turf)
    if city:
        query = query.where(Turf.city.ilike(city))
    if popular:
        query = query.where(Turf.is_popular.is_(True))
    if q:
        like = f"%{q}%"
        query = query.where((Turf.name.ilike(like)) | (Turf.address.ilike(like)))
    turfs = db.scalars(query).all()
    return [
        TurfOut(
            id=str(turf.id),
            name=turf.name,
            city=turf.city,
            address=turf.address,
            price_per_hour=turf.price_per_hour,
            rating=float(turf.rating),
            is_popular=turf.is_popular,
            is_nearby=turf.is_nearby,
        )
        for turf in turfs
    ]


@router.get("/{turf_id}/booked-slots", response_model=list[str])
def booked_slots(turf_id: str, date: str = Query(...), db: Session = Depends(get_db)) -> list[str]:
    try:
        turf_int = int(turf_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid turf_id") from exc

    slots = db.scalars(
        select(Booking.start_time)
        .where(Booking.turf_id == turf_int)
        .where(Booking.date == date)
        .where(Booking.status != "CANCELLED")
    ).all()
    return list(slots)
