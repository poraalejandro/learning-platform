from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from environment variables / .env. Every value here is a
    Phase 0 placeholder — Supabase and rate-limit settings get added as
    later phases need them."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    frontend_origin: str = "http://localhost:3000"

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_origin]


settings = Settings()
