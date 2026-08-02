import os
from google import genai
from google.genai import types

def get_current_weather(location: str) -> str:
    """Returns the current weather in a given location."""
    return f"The weather in {location} is 72 degrees and sunny."

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model='gemini-2.0-flash',
    contents='What is the weather in Paris?',
    config=types.GenerateContentConfig(
        tools=[get_current_weather],
        temperature=0,
    )
)

print(response.text)
if response.function_calls:
    print("Function calls:", [fc.name for fc in response.function_calls])

