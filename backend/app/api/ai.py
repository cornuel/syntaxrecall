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


def get_gen_prompt(user_prompt: str) -> str:
    """
    Constructs the structured prompt for AI generation.

    This prompt enforces a 'Senior Software Architect' persona to ensure technical
    depth and accuracy. It uses a specific tagging system (e.g., lang:, framework:)
    that the frontend uses to render high-energy UI pills.
    """
    return f"""
    ACT AS: A Senior Software Architect and Technical Educator.
    TASK: Create a professional study flashcard for the following concept: {user_prompt}

    Return the response as a JSON object with exactly these keys:
    - title: A short, descriptive title (e.g., "React Memoization", "Rust Ownership", "Vue Composition API").
    - code_snippet: A concise, technically accurate code example. IMPORTANT: Use proper indentation and newline characters (\n) to ensure the code is multi-line and readable.
    - explanation: A clear and brief explanation of the code and concept.
    - language: Use exactly one of these short codes: py, js, ts, jsx, tsx, vue, go, rust, java, cpp, ruby, php, html, css, sql, sh.
    - tags: A list of 3-5 keywords using the following prefix system for high-energy UI pills:
        - Use 'lang:<language>' for the primary language.
        - Use 'framework:<framework>' for frameworks (e.g., React, Vue, FastAPI).
        - Use 'syntax:<syntax>' for specific language syntax.
        - Use 'concept:<concept>' for theoretical concepts.
        - Use 'pattern:<pattern>' for design patterns or architectural patterns.
        - Use 'lib:<library>' for external libraries.

    IMPORTANT: The 'title' field is mandatory.
    EXAMPLE TAGS: ["lang:ts", "framework:react", "concept:hooks", "syntax:useEffect"]

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
    """
    Generates a technical flashcard using a multi-provider AI strategy.

    Tries the user's PREFERRED_PROVIDER first, falling back to any available
    configured provider (Gemini, Qwen, or Groq). This ensures high availability
    for the AI-powered generation feature.
    """
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

        if not text:
            raise ValueError(f"Empty response from {provider} API")

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
