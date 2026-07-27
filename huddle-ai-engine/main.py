from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
from google import genai
from datetime import datetime
from prompts import (
    get_create_event_prompt,
    get_summarize_conversation_prompt,
    get_short_description_prompt,
    get_extract_tasks_prompt,
    get_trip_plan_prompt,
    get_answer_event_questions_prompt,
    get_find_turfs_prompt,
)

app = FastAPI(title="Huddle AI Engine", version="1.0.0")

# Initialize Gemini Client
# It will automatically pick up GEMINI_API_KEY from environment variables
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Warning: Failed to initialize genai client. GEMINI_API_KEY might be missing. {e}")
    client = None

def _generate_json(prompt: str, use_search: bool = False) -> dict:
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized")
    
    try:
        config_opts = {
            'response_mime_type': 'application/json'
        }
        if use_search:
            config_opts['tools'] = [{'google_search': {}}]

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=config_opts
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"[AI Engine] Error generating content: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI response")

class AudioData(BaseModel):
    audio_url: str

class Transcript(BaseModel):
    text: str

class TaskExtraction(BaseModel):
    tasks: list[str]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "huddle-ai-engine"}

@app.post("/transcribe", response_model=Transcript)
def transcribe_audio(data: AudioData):
    # Stub for future Cloud API transcription integration
    return {"text": "This is a placeholder transcript from the audio."}

# Request Models
class PromptRequest(BaseModel):
    prompt: str

class MessagesRequest(BaseModel):
    messages: list[dict]

class DescRequest(BaseModel):
    title: str
    description: str
    category: str

class TextRequest(BaseModel):
    text: str

class DetailsRequest(BaseModel):
    details: str

class QuestionRequest(BaseModel):
    question: str
    context: dict | None = None

class QueryRequest(BaseModel):
    query: str
    context: dict | None = None

@app.post("/create-event-from-prompt")
def create_event_from_prompt(req: PromptRequest):
    current_date = datetime.now().isoformat()
    full_prompt = get_create_event_prompt(req.prompt, current_date)
    return _generate_json(full_prompt)

@app.post("/summarize-conversation")
def summarize_conversation(req: MessagesRequest):
    messages_str = json.dumps(req.messages)
    full_prompt = get_summarize_conversation_prompt(messages_str)
    return _generate_json(full_prompt)

@app.post("/generate-short-description")
def generate_short_description(req: DescRequest):
    full_prompt = get_short_description_prompt(req.title, req.category, req.description)
    return _generate_json(full_prompt)

@app.post("/extract-tasks")
def extract_tasks(req: TextRequest):
    full_prompt = get_extract_tasks_prompt(req.text)
    return _generate_json(full_prompt)

@app.post("/generate-trip-plan")
def generate_trip_plan(req: DetailsRequest):
    full_prompt = get_trip_plan_prompt(req.details)
    return _generate_json(full_prompt)

@app.post("/answer-event-questions")
def answer_event_questions(req: QuestionRequest):
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\nUse this memory to answer the user's question properly."
        
    full_prompt = get_answer_event_questions_prompt(context_str, req.question)
    return _generate_json(full_prompt, use_search=True)

@app.post("/find-turfs")
def find_turfs(req: QueryRequest):
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\n"

    full_prompt = get_find_turfs_prompt(context_str, req.query)
    return _generate_json(full_prompt, use_search=True)
