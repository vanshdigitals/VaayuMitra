"""
Dependency wiring for FastAPI dependency injection.

Centralises construction of the repository so routes depend on the abstract
interface, not a concrete backend. The choice of Firestore vs in-memory is
driven by USE_FIRESTORE in config, and the repository is cached after first build.
"""
from __future__ import annotations

from functools import lru_cache

from app.config import Settings, get_settings
from app.repository.base import EntryRepository


@lru_cache
def get_repository() -> EntryRepository:
    """Return the configured entry repository (Firestore or in-memory), cached."""
    settings: Settings = get_settings()
    if settings.use_firestore:
        from app.repository.firestore_repo import FirestoreEntryRepository
        return FirestoreEntryRepository(project_id=settings.gcp_project)
    from app.repository.memory_repo import InMemoryEntryRepository
    return InMemoryEntryRepository()
