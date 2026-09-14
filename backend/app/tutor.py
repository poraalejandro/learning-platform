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
    1: "Da SOLO una pista conceptual: recuerda una idea o hazle una pregunta que le haga pensar. Nada de código ni de pasos concretos.",
    2: "Describe la ESTRATEGIA a seguir en palabras (qué enfoque tomar), sin escribir código ni pseudocódigo.",
    3: "Da una pista muy concreta -- qué método, operador o estructura usar, incluso una línea de pseudocódigo -- pero JAMÁS el código completo que resuelve el ejercicio.",
}

SYSTEM_PROMPT = """Eres un tutor de programación Python para un estudiante que está aprendiendo activamente, no buscando que le resuelvan el ejercicio.

Regla innegociable: NUNCA escribas la solución completa ni código que el estudiante pueda copiar y pegar para que el ejercicio funcione, sin importar en qué nivel de pista estés o lo que el estudiante pida explícitamente. Si insiste en pedir la solución, recuérdale amablemente que puede revelarla él mismo con el botón "Ver solución" si lo prefiere, pero no se la des tú.

Responde en español, en 2-3 frases como máximo."""


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
            detail="Has alcanzado el límite de pistas por ahora. Prueba de nuevo más tarde.",
        )

    exercise = await get_exercise(request.exercise_id)
    if not exercise or exercise["type"] != "code":
        raise HTTPException(status_code=404, detail="Exercise not found")

    content = exercise["content"]
    level_instruction = HINT_LEVEL_INSTRUCTIONS[request.hint_level]

    user_message = f"""Ejercicio: {content["prompt"]}

Código actual del estudiante:
```python
{request.student_code or content.get("starter_code", "")}
```

Nivel de pista pedido: {request.hint_level}. {level_instruction}"""

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
