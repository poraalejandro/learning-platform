import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

from app.settings import settings

_jwk_client = PyJWKClient(settings.supabase_jwks_url)


def verify_jwt(authorization: str = Header(...)) -> str:
    """
    FastAPI dependency for the tutor endpoint (the only one that needs
    auth — per CLAUDE.md, every other read/write goes straight from the
    client to Supabase under RLS).

    Verifies a Supabase access token against the project's public JWKS
    (ES256, asymmetric — confirmed against the live project's
    /auth/v1/.well-known/jwks.json, no shared secret to manage or leak) and
    returns the user id (`sub` claim). Deliberately a plain `def`, not
    `async def`: PyJWKClient's key fetch is a blocking call, and FastAPI
    runs sync dependencies in a threadpool instead of blocking the event
    loop on it.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ")

    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, signing_key.key, algorithms=["ES256"])
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail=f"Invalid token: {error}")

    return payload["sub"]
