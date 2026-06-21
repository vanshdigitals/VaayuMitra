from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # GCP project settings
    gcp_project: str = "vaayumitra"
    location: str = "asia-south1"
    gemini_model: str = "gemini-2.0-flash"

    # Feature flags — set these to false in tests so no GCP credentials are needed
    use_gemini: bool = True
    use_firestore: bool = True

    # Optional API key for local dev without ADC (leave empty to use ADC in Cloud Run)
    gemini_api_key: str = ""

    # CORS — comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
