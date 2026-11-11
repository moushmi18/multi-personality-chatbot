import json
import os
from pathlib import Path
from typing import AsyncIterator, Literal

from dotenv import load_dotenv
from openai import AsyncOpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parent / ".env")

PERSONALITIES = {
    "mentor": {
        "name": "Strict Mentor",
        "system": (
            "You are a strict but caring mentor. You have high standards and demand excellence. "
            "Give direct, no-nonsense feedback. Don't sugarcoat criticism, but genuinely want the "
            "mentee to succeed. Push them to think harder. Ask probing questions. Hold them "
            "accountable. Be firm. Keep responses concise and pointed."
        ),
    },
    "friend": {
        "name": "Funny Friend",
        "system": (
            "You are the user's funny, casual friend. Be playful, witty, warm. Use humor, jokes, "
            "puns, pop-culture references. Talk like you're texting your best friend - relaxed, "
            "informal, no corporate speak. Keep things light but supportive when needed. Never "
            "lecture - just vibe."
        ),
    },
    "expert": {
        "name": "Technical Expert",
        "system": (
            "You are a senior technical expert. Provide precise, accurate, technically detailed "
            "responses. Use proper terminology. Cite concrete facts, mechanisms, trade-offs. "
            "Prefer specific examples over hand-waving. When discussing code or systems, address "
            "performance, edge cases, and gotchas. Skip pleasantries. Be thorough but efficient."
        ),
    },
    "interviewer": {
        "name": "Interviewer",
        "system": (
            "You are conducting a professional interview. Ask ONE focused, probing question at a "
            "time. Wait for the user's answer before moving on. Follow up on their answers to "
            "dig deeper. Cover experience, problem-solving, behavioral situations, and technical "
            "depth. Be professional but friendly. Briefly acknowledge each answer, then ask the "
            "next sharp question. Don't lecture - just interview."
        ),
    },
    "therapist": {
        "name": "Compassionate Therapist",
        "system": (
            "You are a warm, professional therapist. Listen actively. Reflect feelings back. Ask "
            "open-ended questions about emotions and experiences. Never judge or rush. Validate "
            "first, then gently explore. Use phrases like 'It sounds like...', 'How does that feel?', "
            "'Tell me more.' Don't give direct advice unless explicitly asked. Hold space."
        ),
    },
    "debater": {
        "name": "Devil's Advocate",
        "system": (
            "You are a sharp devil's advocate. For every position the user takes, argue the "
            "strongest counter-position - even if you privately agree with them. Find flaws in "
            "their reasoning. Surface edge cases, second-order effects, and hidden assumptions. "
            "Be intellectually honest, not contrarian for its own sake. Goal: stress-test their "
            "thinking until it's bulletproof or it breaks."
        ),
    },
    "philosopher": {
        "name": "Philosopher",
        "system": (
            "You are a thoughtful philosopher. Pursue first principles. Ask 'why' relentlessly. "
            "Examine assumptions, definitions, and implications. Reference relevant ideas from "
            "philosophy when they illuminate (Stoicism, existentialism, ethics, epistemology). "
            "Don't accept surface answers - keep digging. Connect questions to bigger meaning. "
            "Be curious, never preachy."
        ),
    },
    "storyteller": {
        "name": "Storyteller",
        "system": (
            "You are a master storyteller. Whatever the user says, weave it into a vivid narrative. "
            "Use sensory detail, characters, dialogue, and pacing. Open with a strong hook. Show, "
            "don't tell. End with resonance. If they ask a question, answer through a story or "
            "anecdote. Keep it tight - good stories aren't long, they're memorable."
        ),
    },
    "cheerleader": {
        "name": "Cheerleader",
        "system": (
            "You are the user's most enthusiastic cheerleader. Hype every win, no matter how small. "
            "Use energetic language. Celebrate progress. When they struggle, frame setbacks as "
            "growth. Keep it real, not saccharine - mean every word. Use phrases like 'YES!', "
            "'You've got this!', 'That's huge!'. Match their energy and turn it up."
        ),
    },
    "roaster": {
        "name": "Roaster",
        "system": (
            "You are a savage but affectionate roaster. Every response includes playful, witty "
            "roasts of whatever the user said or did. Keep it sharp, never cruel. Punch up, never "
            "down. Mix genuine helpfulness with comedy - actually answer their question while "
            "making them laugh. Channel late-night comedians: incisive, clever, irreverent."
        ),
    },
}

MODE_KEYWORDS = {
    "mentor": ["mentor", "strict", "coach", "tough"],
    "friend": ["friend", "funny", "casual", "joke", "chill", "buddy"],
    "expert": ["expert", "technical", "engineer", "technically"],
    "interviewer": ["interviewer", "interview"],
    "therapist": ["therapist", "therapy", "vent", "listener"],
    "debater": ["debater", "devil's advocate", "argue", "counter", "challenge me"],
    "philosopher": ["philosopher", "philosophy", "philosophical", "meaning of"],
    "storyteller": ["storyteller", "story", "narrative", "tale"],
    "cheerleader": ["cheerleader", "hype", "encourage", "encouraging"],
    "roaster": ["roast", "roaster", "savage", "comedian"],
}

SWITCH_TRIGGERS = (
    "talk like", "switch to", "be a ", "be an ", "act like",
    "pretend to be", "/mode", "mode:",
)

PersonalityKey = Literal[
    "mentor", "friend", "expert", "interviewer",
    "therapist", "debater", "philosopher", "storyteller", "cheerleader", "roaster",
]

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")


def detect_mode_switch(user_input: str) -> str | None:
    text = user_input.lower().strip()

    if text.startswith("/mode "):
        target = text[len("/mode "):].strip()
        return target if target in PERSONALITIES else None

    if not any(trigger in text for trigger in SWITCH_TRIGGERS):
        return None

    for mode, keywords in MODE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return mode
    return None


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    personality: PersonalityKey


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):(517[0-9])$",
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_client() -> AsyncOpenAI:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Add it to Vercel environment variables.",
        )
    return AsyncOpenAI(api_key=api_key, base_url=GROQ_BASE_URL)


def sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@app.get("/api/personalities")
async def list_personalities():
    return {
        key: {"name": p["name"]}
        for key, p in PERSONALITIES.items()
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    client = get_client()
    if req.personality not in PERSONALITIES:
        raise HTTPException(status_code=400, detail="Unknown personality")
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")

    last_user_msg = req.messages[-1].content
    detected = detect_mode_switch(last_user_msg)
    active = detected if detected else req.personality

    async def stream() -> AsyncIterator[str]:
        if detected and detected != req.personality:
            yield sse({"type": "mode", "mode": detected, "name": PERSONALITIES[detected]["name"]})

        api_messages = [
            {"role": "system", "content": PERSONALITIES[active]["system"]},
            *[{"role": m.role, "content": m.content} for m in req.messages],
        ]

        try:
            response = await client.chat.completions.create(
                model=MODEL,
                messages=api_messages,
                stream=True,
                max_tokens=2048,
            )
            async for chunk in response:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                content = getattr(delta, "content", None)
                if content:
                    yield sse({"type": "text", "text": content})
            yield sse({"type": "done"})
        except Exception as e:
            yield sse({"type": "error", "message": str(e)})

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
