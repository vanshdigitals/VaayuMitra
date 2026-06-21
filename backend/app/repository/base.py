"""
Repository abstraction for tracking footprint entries.

A Protocol decouples the API from the storage backend. The Firestore
implementation is used in production; an in-memory implementation backs local
dev and tests — making persistence fully testable without a database.
"""
from __future__ import annotations

from typing import Protocol

from app.models import CalculateRequest, CalculateResponse, Entry


class EntryRepository(Protocol):
    """Stores and retrieves footprint entries scoped to an anonymous device id."""

    def add(
        self,
        device_id: str,
        profile: CalculateRequest,
        result: CalculateResponse,
    ) -> Entry:
        """Persist a new entry and return it with id and timestamp."""
        ...

    def list_for_device(self, device_id: str, limit: int = 50) -> list[Entry]:
        """Return a device's entries, newest first."""
        ...
