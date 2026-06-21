"""
Firestore-backed repository for production use on Cloud Run.
Uses Application Default Credentials — no API key required in the container.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models import CalculateRequest, CalculateResponse, Entry


class FirestoreEntryRepository:
    def __init__(self, project_id: str) -> None:
        self._project_id = project_id
        # Lazy import: keeps local dev lightweight and tests fast.
        from google.cloud import firestore  # type: ignore[import]
        self._db = firestore.Client(project=project_id)

    def add(
        self,
        device_id: str,
        profile: CalculateRequest,
        result: CalculateResponse,
    ) -> Entry:
        entry_id = uuid.uuid4().hex
        now = datetime.now(tz=timezone.utc)

        doc_ref = (
            self._db.collection("devices")
            .document(device_id)
            .collection("entries")
            .document(entry_id)
        )
        doc_ref.set({
            "device_id": device_id,
            "created_at": now,
            "profile": profile.model_dump(),
            "result": result.model_dump(),
        })

        return Entry(
            id=entry_id,
            device_id=device_id,
            created_at=now,
            profile=profile,
            result=result,
        )

    def list_for_device(self, device_id: str, limit: int = 50) -> list[Entry]:
        docs = (
            self._db.collection("devices")
            .document(device_id)
            .collection("entries")
            .order_by("created_at", direction="DESCENDING")
            .limit(limit)
            .stream()
        )
        entries = []
        for doc in docs:
            data = doc.to_dict()
            entries.append(Entry(
                id=doc.id,
                device_id=data["device_id"],
                created_at=data["created_at"],
                profile=CalculateRequest(**data["profile"]),
                result=CalculateResponse(**data["result"]),
            ))
        return entries
