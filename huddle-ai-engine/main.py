from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Huddle AI Engine", version="1.0.0")

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
    # Stub for future Cloud API transcription integration (e.g., Deepgram, Whisper API)
    # Returning a dummy transcript for now
    return {"text": "This is a placeholder transcript from the audio."}

@app.post("/extract-tasks", response_model=TaskExtraction)
def extract_tasks(transcript: Transcript):
    # Stub for future Cloud LLM extraction (e.g., Gemini, Claude)
    # Returning dummy tasks for now
    return {"tasks": ["Placeholder Task 1", "Placeholder Task 2"]}
