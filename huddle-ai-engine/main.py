from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
from google import genai
from datetime import datetime

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
            model='gemini-3.5-flash',
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
    
    full_prompt = f"""
      You are an AI assistant that extracts event details from a user's natural language description.
      Your job is strictly to extract the provided information and structure it into a specific JSON format.
      
      User text: "{req.prompt}"
      
      Current Date and Time (ISO): {current_date}
      Use this date to correctly resolve relative dates like "today", "tomorrow", "this Saturday", "next weekend".

      IMPORTANT RULES:
      1. Do NOT invent or assume information. If a detail is NOT explicitly mentioned or clearly implied, set its value to null.
      2. If important fields (like exact date, time, location, or maximum participants) are missing, add descriptive strings to the "missingInformation" array.
      3. For "category", select the closest match.
      4. "location.latitude" and "location.longitude" MUST ALWAYS be null.
      5. "categoryDetails" should ONLY contain keys from the selected category below. If a specific detail is not found in the text, set its value to null.

      Categories and their specific fields for "categoryDetails":
      - "Sports": sportType, skillLevel, equipmentNeeded, groundVenue, entryFee, teamSize
      - "Technology": topic, experienceLevel, mode, techStack, requirements
      - "Education": subject, level, materialsNeeded, duration, instructor
      - "Business": meetingType, industry, targetAudience, dressCode
      - "Design": designTool, skillLevel, materialsNeeded
      - "Gaming": game, platform, rankRequirement, voiceChat, maxPlayers
      - "Music": genre, instrument, skillLevel, bringInstruments
      - "Entertainment": eventName, venue, ticketPrice
      - "Travel": destination, startDate, endDate, estimatedBudget, transport, accommodation
      - "Photography": location, cameraRequired, theme
      - "Food": restaurant, cuisine, budget, reservationNeeded
      - "Community": organization, cause, volunteersNeeded
      - "Health & Fitness": activity, fitnessLevel, duration
      - "Arts & Culture": artType, materials, performanceRequired
      - "Pets": petType, activity, venue
      - "Family": occasion, venue
      - "Social": eventType, venue
      - "DIY & Hobbies": hobbyType, materials
      - "Others": additionalDetails
      
      Return ONLY a valid JSON object matching exactly this structure:
      {{
        "title": "string or null",
        "description": "string or null",
        "category": "string or null",
        "date": "YYYY-MM-DD or null",
        "startTime": "HH:mm format (24-hour) or null",
        "endTime": "HH:mm format (24-hour) or null",
        "location": {{
          "name": "string or null",
          "address": "string or null",
          "latitude": null,
          "longitude": null
        }},
        "maxParticipants": "number or null",
        "tags": ["array of strings"],
        "missingInformation": ["array of strings describing missing key details"],
        "categoryDetails": {{
           // Provide keys and values strictly based on the chosen category above
        }}
      }}
    """
    return _generate_json(full_prompt)

@app.post("/summarize-conversation")
def summarize_conversation(req: MessagesRequest):
    messages_str = json.dumps(req.messages)
    full_prompt = f"""
      Summarize the following chat conversation strictly in JSON format:
      {messages_str}
      
      Return ONLY a JSON object with a single key "summary" containing the text summary.
    """
    return _generate_json(full_prompt)

@app.post("/generate-short-description")
def generate_short_description(req: DescRequest):
    full_prompt = f"""
      You are an AI assistant that creates clear, concise, single-sentence descriptions for events to be displayed on an explore page.
      
      Event Title: "{req.title}"
      Category: "{req.category}"
      Description: "{req.description}"
      
      Return ONLY a JSON object with a single key "shortDescription" containing the one-sentence description.
    """
    return _generate_json(full_prompt)

@app.post("/extract-tasks")
def extract_tasks(req: TextRequest):
    full_prompt = f"""
      Extract actionable tasks or to-dos from the following text strictly in JSON format:
      "{req.text}"
      
      Return ONLY a JSON array of objects under the key "tasks", where each object has:
      - task (string)
      - assignee (string, if mentioned, otherwise null)
      - deadline (string, if mentioned, otherwise null)
    """
    return _generate_json(full_prompt)

@app.post("/generate-trip-plan")
def generate_trip_plan(req: DetailsRequest):
    full_prompt = f"""
      Generate a trip plan based on the following details strictly in JSON format:
      "{req.details}"
      
      Return ONLY a JSON object containing:
      - destination (string)
      - duration (string)
      - itinerary (array of objects with 'day' and 'activities' keys)
    """
    return _generate_json(full_prompt)

@app.post("/answer-event-questions")
def answer_event_questions(req: QuestionRequest):
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\nUse this memory to answer the user's question properly."
        
    full_prompt = f"""
      You are Huddle AI, a friendly, human-like companion in a community and event app called "Huddle".
      Users will talk to you naturally, ask for advice, or just casually chat. 
      You should understand natural human language and respond warmly, naturally, and helpfully.
      While you specialize in helping with community events, sports, and meetups, you can engage in casual conversation about anything they ask.
      {context_str}
      
      User's input: "{req.question}"
      
      Return your response strictly in JSON format.
      Return ONLY a JSON object with a single key "answer" containing your response.
      Example: {{ "answer": "Hello! I'm doing great. How can I help you today?" }}
    """
    return _generate_json(full_prompt, use_search=True)

@app.post("/find-turfs")
def find_turfs(req: QueryRequest):
    context_str = ""
    if req.context:
        context_str = f"\n\n--- CURRENT CONTEXT & MEMORY ---\n{json.dumps(req.context, indent=2)}\n"

    full_prompt = f"""
      You are a knowledgeable local guide. Find turfs (sports grounds/venues) based on the user's location query:
      "{req.query}"
      {context_str}
      
      Return ONLY a JSON array containing objects with the following keys:
      - name (string)
      - address (string)
      - contact (string, if known, otherwise "Contact not available")
      
      If you can't find any specific turfs for the query, return an empty array [].
    """
    return _generate_json(full_prompt, use_search=True)
