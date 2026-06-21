"""Entry tracking endpoints: save a footprint snapshot and list device history."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query

from app.deps import get_repository
from app.models import Entry, EntryCreate
from app.repository.base import EntryRepository

router = APIRouter(prefix="/api/entries", tags=["entries"])

# Validate device_id path parameter: alphanumeric + dash/underscore, reasonable length.
_DEVICE_ID = Path(min_length=4, max_length=200, pattern=r"^[A-Za-z0-9_-]+$")


@router.post("", response_model=Entry, status_code=201)
def create_entry(
    payload: EntryCreate,
    repo: EntryRepository = Depends(get_repository),
) -> Entry:
    """Persist a footprint entry for the anonymous device."""
    return repo.add(payload.device_id, payload.profile, payload.result)


@router.get("/{device_id}", response_model=list[Entry])
def list_entries(
    device_id: str = _DEVICE_ID,
    limit: int = Query(50, ge=1, le=200),
    repo: EntryRepository = Depends(get_repository),
) -> list[Entry]:
    """Return a device's footprint history, newest first."""
    return repo.list_for_device(device_id, limit=limit)
