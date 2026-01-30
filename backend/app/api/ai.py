import json
import google.generativeai as genai
from openai import OpenAI
from groq import Groq
import anthropic
from fastapi import APIRouter, HTTPException, Depends, status
from ..schemas import AIPromptRequest, AIProjectResponse, AITestRequest
from .auth import get_current_user
from .. import models

router = APIRouter()


def get_gen_prompt(user_prompt: str) -> str:
    """
    Constructs the structured prompt for AI generation.
    """
    return f"""
    ACT AS: A Senior Software Architect and Technical Educator.
    TASK: Create a professional study flashcard for the following concept: {user_prompt}

    You MUST return a JSON object with exactly these keys:
    - title: A short, descriptive title (e.g., "React Memoization", "Rust Ownership").
    - code_snippet: A standalone, technically accurate, and multi-line code example. DO NOT just show the general syntax; provide a concrete, runnable example that demonstrates the concept in action.
    - explanation: A clear and brief explanation of the code and the concept. Use standard Markdown (**bold**, `code`).
    - language: Use exactly one of these: py, js, ts, jsx, tsx, vue, go, rust, java, cpp, ruby, php, html, css, sql, sh.
    - tags: A list of 3-5 keywords using: 'lang:<language>', 'framework:<framework>', 'concept:<concept>', 'syntax:<syntax>', 'pattern:<pattern>', 'lib:<library>'.

    CRITICAL CONSTRAINTS:
    1. 'code_snippet' MUST be a code block, not an empty string or just the explanation repeated.
    2. Ensure the code is properly indented with newline characters (\\n).
    3. The entire response must be a single, valid JSON object.

    EXAMPLE RESPONSE:
    {{
      "title": "Python List Comprehension",
      "code_snippet": "numbers = [1, 2, 3, 4, 5]\\nsquares = [x**2 for x in numbers if x % 2 == 0]\\nprint(squares)  # Output: [4, 16]",
      "explanation": "List comprehensions provide a concise way to create lists. This example iterates through `numbers`, filters for even values, and squares them.",
      "language": "py",
      "tags": ["lang:py", "syntax:comprehension", "concept:functional"]
    }}
    """


async def generate_gemini(prompt: str, api_key: str, model_name: str):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        if not response.text:
            raise ValueError("Empty response from Gemini API")
        return response.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gemini Error: {str(e)}")


async def generate_openai(prompt: str, api_key: str, model_name: str):
    try:
        client = OpenAI(api_key=api_key)
        # Some models (like vision or older ones) might not support json_object
        response_format = {"type": "json_object"}

        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a Senior Software Architect. Always return technical flashcards as a valid JSON object. Never include markdown code blocks around the JSON itself if using json_object mode.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format=response_format,
        )
        return completion.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OpenAI Error: {str(e)}")


async def generate_anthropic(prompt: str, api_key: str, model_name: str):
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=model_name,
            max_tokens=2000,
            system="You are a helpful assistant that generates coding flashcards in JSON format. Always return ONLY the JSON object.",
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Anthropic Error: {str(e)}")


async def generate_groq(prompt: str, api_key: str, model_name: str):
    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a Senior Software Architect. Always return technical flashcards as a valid JSON object. Ensure the 'code_snippet' field is never empty.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        return completion.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Groq Error: {str(e)}")


@router.post("/test-connection")
async def test_connection(
    request: AITestRequest, current_user: models.User = Depends(get_current_user)
):
    """
    Verifies that the provided API key and model work correctly.
    """
    test_prompt = 'Respond with a JSON object: {"status": "ok"}'
    try:
        if request.provider == "gemini":
            await generate_gemini(test_prompt, request.api_key, request.model)
        elif request.provider == "openai":
            await generate_openai(test_prompt, request.api_key, request.model)
        elif request.provider == "anthropic":
            await generate_anthropic(test_prompt, request.api_key, request.model)
        elif request.provider == "groq":
            await generate_groq(test_prompt, request.api_key, request.model)
        elif request.provider == "qwen":
            # Reuse OpenAI logic for Qwen (OpenAI compatible)
            client = OpenAI(
                api_key=request.api_key,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            )
            client.chat.completions.create(
                model=request.model, messages=[{"role": "user", "content": test_prompt}]
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Unsupported provider: {request.provider}"
            )

        return {
            "status": "success",
            "message": f"Connection to {request.provider} verified successfully.",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection test failed: {str(e)}")


@router.post("/generate", response_model=AIProjectResponse)
async def generate_card(
    request: AIPromptRequest, current_user: models.User = Depends(get_current_user)
):
    """
    Generates a technical flashcard using the user-provided AI credentials.
    """
    prompt = get_gen_prompt(request.prompt)

    try:
        if request.provider == "gemini":
            text = await generate_gemini(prompt, request.api_key, request.model)
        elif request.provider == "openai":
            text = await generate_openai(prompt, request.api_key, request.model)
        elif request.provider == "anthropic":
            text = await generate_anthropic(prompt, request.api_key, request.model)
        elif request.provider == "groq":
            text = await generate_groq(prompt, request.api_key, request.model)
        elif request.provider == "qwen":
            # Qwen uses OpenAI client
            client = OpenAI(
                api_key=request.api_key,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            )
            completion = client.chat.completions.create(
                model=request.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            text = completion.choices[0].message.content
        else:
            raise HTTPException(
                status_code=400, detail=f"Unknown provider: {request.provider}"
            )

        if not text:
            raise ValueError(f"Empty response from {request.provider} API")

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
        error_msg = str(e)
        raise HTTPException(
            status_code=500,
            detail=f"AI Generation Error ({request.provider}): {error_msg}",
        )
