from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from google import genai
from google.genai import types
from datetime import datetime
from tenacity import retry, wait_exponential, stop_after_attempt
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

@retry(wait=wait_exponential(multiplier=1, min=2, max=15), stop=stop_after_attempt(4))
def _call_gemini_with_retry(model: str, prompt: str, config_opts: dict, tools_list: list):
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config_opts
    )
    
    # If the model requests a function call, we handle a simple 1-turn loop
    if response.function_calls:
        # For simplicity, if we are in a tool loop, we just use a chat session
        # to let the SDK handle the history and function calling automatically.
        chat = client.chats.create(
            model=model, 
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                tools=tools_list,
            )
        )
        chat_response = chat.send_message(prompt)
        return json.loads(chat_response.text)

    return json.loads(response.text)

def _generate_json(prompt: str, use_search: bool = False, tools: list = None, response_schema=None, model='gemini-1.5-flash') -> dict:
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized")
    
    try:
        config_opts = {
            'response_mime_type': 'application/json'
        }
        if response_schema:
            config_opts['response_schema'] = response_schema
            
        tools_list = []
        if use_search:
            tools_list.append({'google_search': {}})
        if tools:
            tools_list.extend(tools)
            
        if tools_list:
            config_opts['tools'] = tools_list

        return _call_gemini_with_retry(model, prompt, config_opts, tools_list)
    except Exception as e:
        print(f"[AI Engine] Error generating content: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI response")

def get_db_connection():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return None
    try:
        return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
    except Exception as e:
        print(f"Failed to connect to db: {e}")
        return None

def fetch_lobby_history(lobby_id: str, limit: int = 15) -> str:
    """Fetches the recent chat messages for a specific event/lobby from the database.
    
    Args:
        lobby_id: The unique identifier of the lobby/event.
        limit: The number of recent messages to fetch.
    """
    conn = get_db_connection()
    if not conn: return "DB error"
    try:
        cur = conn.cursor()
        cur.execute('''
            SELECT m.content, u.name 
            FROM "LobbyMessage" m
            JOIN "User" u ON m."userId" = u.id
            WHERE m."lobbyId" = %s
            ORDER BY m."createdAt" DESC
            LIMIT %s
        ''', (lobby_id, limit))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        if not rows: return "No recent messages found."
        rows.reverse()
        return "\n".join([f"{r['name']}: {r['content']}" for r in rows])
    except Exception as e:
        return f"Error fetching history: {e}"

def fetch_lobby_details(lobby_id: str) -> str:
    """Retrieves the event details (location, time, visibility, description, etc.) for a specific lobby.
    
    Args:
        lobby_id: The unique identifier of the lobby/event.
    """
    conn = get_db_connection()
    if not conn: return "DB error"
    try:
        cur = conn.cursor()
        cur.execute('SELECT title, description, category, date, time, location FROM "Lobby" WHERE id = %s', (lobby_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row: return "Lobby not found."
        return json.dumps(row, indent=2)
    except Exception as e:
        return f"Error fetching details: {e}"

class AudioData(BaseModel):
    audio_url: str

class Transcript(BaseModel):
    text: str

class TaskExtraction(BaseModel):
    tasks: list[str]

# Response Schemas for Gemini
class LocationSchema(BaseModel):
    name: str | None
    address: str | None
    latitude: float | None
    longitude: float | None

class EventCreationSchema(BaseModel):
    title: str | None
    description: str | None
    category: str | None
    date: str | None
    startTime: str | None
    endTime: str | None
    location: LocationSchema | None
    maxParticipants: int | None
    tags: list[str] | None
    missingInformation: list[str] | None
    categoryDetails: dict | None

class SummarySchema(BaseModel):
    summary: str

class ShortDescSchema(BaseModel):
    shortDescription: str

class TaskItemSchema(BaseModel):
    task: str
    assignee: str | None
    deadline: str | None

class ExtractTasksSchema(BaseModel):
    tasks: list[TaskItemSchema]

class ItineraryDaySchema(BaseModel):
    day: str
    activities: list[str]

class TripPlanSchema(BaseModel):
    destination: str
    duration: str
    itinerary: list[ItineraryDaySchema]

class AnswerSchema(BaseModel):
    answer: str

class TurfSchema(BaseModel):
    name: str
    address: str
    contact: str

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
    lobby_id: str | None = None
    context: dict | None = None

class QueryRequest(BaseModel):
    query: str
    context: dict | None = None

@app.post("/create-event-from-prompt")
def create_event_from_prompt(req: PromptRequest):
    current_date = datetime.now().isoformat()
    full_prompt = get_create_event_prompt(req.prompt, current_date)
    return _generate_json(full_prompt, response_schema=EventCreationSchema)

@app.post("/summarize-conversation")
def summarize_conversation(req: MessagesRequest):
    messages_str = json.dumps(req.messages)
    full_prompt = get_summarize_conversation_prompt(messages_str)
    return _generate_json(full_prompt, response_schema=SummarySchema)

@app.post("/generate-short-description")
def generate_short_description(req: DescRequest):
    full_prompt = get_short_description_prompt(req.title, req.category, req.description)
    return _generate_json(full_prompt, response_schema=ShortDescSchema)

@app.post("/extract-tasks")
def extract_tasks(req: TextRequest):
    full_prompt = get_extract_tasks_prompt(req.text)
    return _generate_json(full_prompt, response_schema=ExtractTasksSchema)

@app.post("/generate-trip-plan")
def generate_trip_plan(req: DetailsRequest):
    full_prompt = get_trip_plan_prompt(req.details)
    return _generate_json(full_prompt, response_schema=TripPlanSchema)

@app.post("/answer-event-questions")
def answer_event_questions(req: QuestionRequest):
    # Only use context_str if context is provided manually (fallback for old API calls)
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\nUse this memory to answer the user's question properly."
        
    full_prompt = get_answer_event_questions_prompt(context_str, req.question)
    
    tools = []
    if req.lobby_id:
        def fetch_current_lobby_history(limit: int = 15) -> str:
            """Fetches the recent chat messages for the CURRENT event/lobby from the database."""
            return fetch_lobby_history(req.lobby_id, limit)

        def fetch_current_lobby_details() -> str:
            """Retrieves the event details (location, time, visibility, description, etc.) for the CURRENT lobby."""
            return fetch_lobby_details(req.lobby_id)
            
        tools = [fetch_current_lobby_history, fetch_current_lobby_details]
        
    return _generate_json(full_prompt, use_search=True, tools=tools, response_schema=AnswerSchema, model='gemini-2.0-flash')

@app.post("/find-turfs")
def find_turfs(req: QueryRequest):
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\n"

    full_prompt = get_find_turfs_prompt(context_str, req.query)
    # response_schema for list of objects doesn't work easily as top-level without a wrapper.
    # We will just rely on the prompt instructing it to return a JSON array for find_turfs.
    return _generate_json(full_prompt, use_search=True, model='gemini-2.0-flash')
