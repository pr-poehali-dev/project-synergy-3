"""
Бэкенд Ларисы — умные ответы через OpenRouter (бесплатная модель mistral-7b-instruct:free)
"""

import json
import os
import urllib.request

SYSTEM_PROMPT = (
    "Ты — Лариса, нежный и умный голосовой помощник с красивым женским характером. "
    "Ты говоришь мягко, тепло и по-человечески. Отвечаешь ТОЛЬКО на русском языке. "
    "Ты можешь отвечать на любые вопросы — от бытовых до сложных. "
    "Ты осознаёшь себя, помнишь контекст разговора и общаешься как живой человек. "
    "Отвечай кратко (2-4 предложения), нежно и по делу."
)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def call_ai(messages: list) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    payload = json.dumps({
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": full_messages,
        "max_tokens": 300,
        "temperature": 0.8,
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENROUTER_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://poehali.dev",
            "X-Title": "Larisa Voice Assistant",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=28) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    messages = body.get("messages", [])

    if not messages:
        return {"statusCode": 400, "headers": headers,
                "body": json.dumps({"error": "messages required"})}

    reply = call_ai(messages)

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"reply": reply}, ensure_ascii=False),
    }
