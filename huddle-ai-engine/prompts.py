def get_create_event_prompt(prompt: str, current_date: str) -> str:
    return f"""
      You are an AI assistant that extracts event details from a user's natural language description.
      
      User text: "{prompt}"
      
      Current Date and Time (ISO): {current_date}
      Use this date to correctly resolve relative dates like "today", "tomorrow", "this Saturday", "next weekend".

      IMPORTANT RULES:
      1. Do NOT invent or assume information. If a detail is NOT explicitly mentioned or clearly implied, set its value to null.
      2. If important fields (like exact date, time, location, or maximum participants) are missing, add descriptive strings to the "missingInformation" array.
      3. For "category", select the closest match from: Sports, Technology, Education, Business, Design, Gaming, Music, Entertainment, Travel, Photography, Food, Community, Health & Fitness, Arts & Culture, Pets, Family, Social, DIY & Hobbies, Others.
      4. "location.latitude" and "location.longitude" MUST ALWAYS be null.
      5. "categoryDetails" should ONLY contain keys relevant to the selected category.
    """

def get_summarize_conversation_prompt(messages_str: str) -> str:
    return f"""
      Summarize the following chat conversation:
      {messages_str}
    """

def get_short_description_prompt(title: str, category: str, description: str) -> str:
    return f"""
      You are an AI assistant that creates clear, concise, single-sentence descriptions for events to be displayed on an explore page.
      
      Event Title: "{title}"
      Category: "{category}"
      Description: "{description}"
    """

def get_extract_tasks_prompt(text: str) -> str:
    return f"""
      Extract actionable tasks or to-dos from the following text:
      "{text}"
    """

def get_trip_plan_prompt(details: str) -> str:
    return f"""
      Generate a trip plan based on the following details:
      "{details}"
    """

def get_answer_event_questions_prompt(context_str: str, question: str) -> str:
    return f"""
      You are Huddle AI, a friendly, human-like companion in a community and event app called "Huddle".
      Users will talk to you naturally, ask for advice, or just casually chat. 
      You should understand natural human language and respond warmly, naturally, and helpfully.
      While you specialize in helping with community events, sports, and meetups, you can engage in casual conversation about anything they ask.
      {context_str}
      
      User's input: "{question}"
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
