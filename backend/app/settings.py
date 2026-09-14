from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    frontend_origin: str = "http://localhost:3000"

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    groq_api_key: str = ""

    tutor_rate_limit_window_minutes: int = 60
    tutor_rate_limit_max_requests: int = 30

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_origin]

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"


settings = Settings()
