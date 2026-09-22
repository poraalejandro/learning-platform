import asyncio

from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from pydantic import BaseModel, Field

from app.auth import verify_jwt
from app.settings import settings
from app.supabase_admin import check_rate_limit, get_exercise

router = APIRouter(prefix="/tutor", tags=["tutor"])

groq_client = Groq(api_key=settings.groq_api_key)
MODEL_NAME = "qwen/qwen3.8-27b"

# The hint ladder (docs/architecture.md §3): each rung gives away more than
# the last, but rung 3 still stops short of runnable code — that line is
# drawn in the system prompt below, not left to the model's judgment alone.
HINT_LEVEL_INSTRUCTIONS = {
    1: "Give ONLY a conceptual hint: recall an idea, or ask a question that makes them think. No code, no concrete steps.",
    2: "Describe the STRATEGY to follow in words (what approach to take), without writing code or pseudocode.",
    3: "Give a very concrete hint -- which method, operator, or structure to use, even a line of pseudocode -- but NEVER the full code that solves the exercise.",
}

SYSTEM_PROMPT = """You are a Python programming tutor for a student who is actively learning, not looking to have the exercise solved for them.

Non-negotiable rule: NEVER write the complete solution or code the student could copy-paste to make the exercise pass, no matter what hint level you're at or what the student explicitly asks for. If they insist on asking for the solution, gently remind them they can reveal it themselves with the "Reveal solution" button if they prefer, but don't give it to them yourself.

Answer in English, in 2-3 sentences at most."""


class HintRequest(BaseModel):
    exercise_id: str
    student_code: str = ""
    hint_level: int = Field(ge=1, le=3)


class HintResponse(BaseModel):
    hint: str


@router.post("/hint", response_model=HintResponse)
async def get_hint(request: HintRequest, user_id: str = Depends(verify_jwt)):
    allowed = await check_rate_limit(user_id)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="You've hit the hint limit for now. Try again later.",
        )

    exercise = await get_exercise(request.exercise_id)
    if not exercise or exercise["type"] != "code":
        raise HTTPException(status_code=404, detail="Exercise not found")

    content = exercise["content"]
    level_instruction = HINT_LEVEL_INSTRUCTIONS[request.hint_level]

    user_message = f"""Exercise: {content["prompt"]}

Student's current code:
```python
{request.student_code or content.get("starter_code", "")}
```

Requested hint level: {request.hint_level}. {level_instruction}"""

    # Groq's SDK is sync; run it off the event loop rather than blocking it
    # alongside the async Supabase calls above.
    response = await asyncio.to_thread(
        groq_client.chat.completions.create,
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        reasoning_effort="none",
        max_completion_tokens=250,
    )

    return HintResponse(hint=response.choices[0].message.content)
