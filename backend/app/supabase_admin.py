"""
Server-only Supabase access via the service role key (bypasses RLS) — used
exclusively for the tutor endpoint's rate-limit bookkeeping and exercise
lookup. Never exposed to the frontend; the client always talks to Supabase
directly with its own (RLS-scoped) session, per docs/architecture.md.
"""

import httpx

from app.settings import settings


def _headers() -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


async def check_rate_limit(user_id: str) -> bool:
    """Calls the atomic check-and-increment RPC (see migration 0007)."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.supabase_url}/rest/v1/rpc/check_and_increment_tutor_rate_limit",
            headers=_headers(),
            json={
                "p_user_id": user_id,
                "p_window_minutes": settings.tutor_rate_limit_window_minutes,
                "p_max_requests": settings.tutor_rate_limit_max_requests,
            },
        )
        response.raise_for_status()
        return response.json()


async def get_exercise(exercise_id: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.supabase_url}/rest/v1/exercises",
            headers=_headers(),
            params={"id": f"eq.{exercise_id}", "select": "id,node_id,type,content"},
        )
        response.raise_for_status()
        rows = response.json()
        return rows[0] if rows else None
