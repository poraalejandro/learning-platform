import { createClient } from "@/lib/supabase/client";

export class TutorError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Calls the FastAPI tutor endpoint for a contextual hint — the one place
 * in the app that talks to the backend instead of Supabase directly, since
 * it's the one place with a real per-request cost (the Groq call). */
export async function requestHint(exerciseId: string, studentCode: string, hintLevel: number): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new TutorError("Not signed in", 401);

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tutor/hint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ exercise_id: exerciseId, student_code: studentCode, hint_level: hintLevel }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new TutorError(body?.detail ?? `Tutor request failed (${response.status})`, response.status);
  }

  const data = (await response.json()) as { hint: string };
  return data.hint;
}
