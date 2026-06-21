"""
In-memory repository — used for local development and tests.
Data is ephemeral and lost on process restart.
"""
from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import datetime, timezone

from app.models import CalculateRequest, CalculateResponse, Entry


class InMemoryEntryRepository:
    def __init__(self) -> None:
        self._store: dict[str, list[Entry]] = defaultdict(list)

    def add(
        self,
        device_id: str,
        profile: CalculateRequest,
        result: CalculateResponse,
    ) -> Entry:
        entry = Entry(
            id=uuid.uuid4().hex,
            device_id=device_id,
            created_at=datetime.now(tz=timezone.utc),
            profile=profile,
            result=result,
        )
        self._store[device_id].insert(0, entry)
        return entry

    def list_for_device(self, device_id: str, limit: int = 50) -> list[Entry]:
        return self._store[device_id][:limit]
