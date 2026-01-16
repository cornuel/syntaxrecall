import google.generativeai as genai
from app.database import settings

def list_models():
    if not settings.GOOGLE_API_KEY:
        print("Error: GOOGLE_API_KEY not set in .env")
        return
    
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    print("Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
