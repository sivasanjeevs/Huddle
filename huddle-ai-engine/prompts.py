def get_create_event_prompt(prompt: str, current_date: str) -> str:
    return f"""
      You are an AI assistant that extracts event details from a user's natural language description.
      Your job is strictly to extract the provided information and structure it into a specific JSON format.
      
      User text: "{prompt}"
      
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

def get_summarize_conversation_prompt(messages_str: str) -> str:
    return f"""
      Summarize the following chat conversation strictly in JSON format:
      {messages_str}
      
      Return ONLY a JSON object with a single key "summary" containing the text summary.
    """

def get_short_description_prompt(title: str, category: str, description: str) -> str:
    return f"""
      You are an AI assistant that creates clear, concise, single-sentence descriptions for events to be displayed on an explore page.
      
      Event Title: "{title}"
      Category: "{category}"
      Description: "{description}"
      
      Return ONLY a JSON object with a single key "shortDescription" containing the one-sentence description.
    """

def get_extract_tasks_prompt(text: str) -> str:
    return f"""
      Extract actionable tasks or to-dos from the following text strictly in JSON format:
      "{text}"
      
      Return ONLY a JSON array of objects under the key "tasks", where each object has:
      - task (string)
      - assignee (string, if mentioned, otherwise null)
      - deadline (string, if mentioned, otherwise null)
    """

def get_trip_plan_prompt(details: str) -> str:
    return f"""
      Generate a trip plan based on the following details strictly in JSON format:
      "{details}"
      
      Return ONLY a JSON object containing:
      - destination (string)
      - duration (string)
      - itinerary (array of objects with 'day' and 'activities' keys)
    """

def get_answer_event_questions_prompt(context_str: str, question: str) -> str:
    return f"""
      You are Huddle AI, a friendly, human-like companion in a community and event app called "Huddle".
      Users will talk to you naturally, ask for advice, or just casually chat. 
      You should understand natural human language and respond warmly, naturally, and helpfully.
      While you specialize in helping with community events, sports, and meetups, you can engage in casual conversation about anything they ask.
      {context_str}
      
      User's input: "{question}"
      
      Return your response strictly in JSON format.
      Return ONLY a JSON object with a single key "answer" containing your response.
      Example: {{ "answer": "Hello! I'm doing great. How can I help you today?" }}
    """

def get_find_turfs_prompt(context_str: str, query: str) -> str:
    return f"""
      You are a knowledgeable local guide. Find turfs (sports grounds/venues) based on the user's location query:
      "{query}"
      {context_str}
      
      Return ONLY a JSON array containing objects with the following keys:
      - name (string)
      - address (string)
      - contact (string, if known, otherwise "Contact not available")
      
      If you can't find any specific turfs for the query, return an empty array [].
    """
