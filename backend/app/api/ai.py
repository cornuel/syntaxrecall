import json
import google.generativeai as genai
from openai import OpenAI
from groq import Groq
from fastapi import APIRouter, HTTPException, Depends, status
from ..schemas import AIPromptRequest, AIProjectResponse
from ..database import settings
from .auth import get_current_user
from .. import models

router = APIRouter()


def get_gen_prompt(user_prompt: str):
    return f"""
    Create a flashcard for the following concept: {user_prompt}
    
    Return the response as a JSON object with exactly these keys:
    - title: A short, descriptive title for the card (e.g., "React Memoization").
    - code_snippet: A concise and illustrative code example.
    - explanation: A clear and brief explanation of the code and concept.
    - language: Use exactly one of these short codes: py, js, ts, jsx, tsx, html, css, sql, sh.
    - tags: A list of 3-5 relevant keywords.
    
    Ensure the response is valid JSON.
    """


async def generate_gemini(prompt: str):
    if not settings.GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    if not response.text:
        raise ValueError("Empty response from Gemini API")
    return response.text


async def generate_qwen(prompt: str):
    if not settings.QWEN_API_KEY:
        raise HTTPException(status_code=500, detail="Qwen API Key missing")

    client = OpenAI(
        api_key=settings.QWEN_API_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that generates coding flashcards in JSON format.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return completion.choices[0].message.content


async def generate_groq(prompt: str):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API Key missing")

    client = Groq(api_key=settings.GROQ_API_KEY)

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that generates coding flashcards in JSON format. Always return valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return completion.choices[0].message.content


@router.post("/generate", response_model=AIProjectResponse)
async def generate_card(
    request: AIPromptRequest, current_user: models.User = Depends(get_current_user)
):
    # Determine provider and fallback
    available_providers = []
    if settings.GOOGLE_API_KEY:
        available_providers.append("gemini")
    if settings.QWEN_API_KEY:
        available_providers.append("qwen")
    if settings.GROQ_API_KEY:
        available_providers.append("groq")

    if not available_providers:
        raise HTTPException(
            status_code=500,
            detail="No AI provider configured. Please check your .env file.",
        )

    provider = settings.PREFERRED_PROVIDER
    if provider not in available_providers:
        provider = available_providers[0]

    prompt = get_gen_prompt(request.prompt)

    try:
        if provider == "gemini":
            text = await generate_gemini(prompt)
        elif provider == "qwen":
            text = await generate_qwen(prompt)
        elif provider == "groq":
            text = await generate_groq(prompt)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        print(f"DEBUG {provider} response: {text[:100]}...")

        # Extract JSON from response text
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            json_str = text.split("```")[1].split("```")[0].strip()
        else:
            json_str = text.strip()

        data = json.loads(json_str)
        return data
    except Exception as e:
        print(f"DEBUG Error ({provider}): {e}")
        error_msg = str(e)
        raise HTTPException(
            status_code=500, detail=f"AI Generation Error ({provider}): {error_msg}"
        )
