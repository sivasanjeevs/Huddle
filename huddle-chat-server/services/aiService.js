class AIService {
  constructor() {
    this.engineUrl = process.env.AI_ENGINE_URL || 'http://ai-engine:8000';
  }

  /**
   * Helper function to call the Python AI Engine
   */
  async _postToEngine(endpoint, payload) {
    try {
      const response = await fetch(`${this.engineUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`AI Engine error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[AIService] Error calling ${endpoint}:`, error);
      throw new Error("Failed to generate AI response");
    }
  }

  /**
   * Create an event from a user prompt
   */
  async createEventFromPrompt(prompt) {
    return this._postToEngine('/create-event-from-prompt', { prompt });
  }

  /**
   * Summarize a conversation
   */
  async summarizeConversation(messages) {
    return this._postToEngine('/summarize-conversation', { messages });
  }

  /**
   * Generate a short description for a lobby
   */
  async generateShortDescription(title, description, category) {
    return this._postToEngine('/generate-short-description', { title, description, category });
  }

  /**
   * Extract tasks/todos from text
   */
  async extractTasks(text) {
    return this._postToEngine('/extract-tasks', { text });
  }

  /**
   * Generate a trip plan based on details
   */
  async generateTripPlan(details) {
    return this._postToEngine('/generate-trip-plan', { details });
  }

  /**
   * Answer questions and chat naturally with the user
   */
  async answerEventQuestions(question, context) {
    return this._postToEngine('/answer-event-questions', { question, context });
  }

  /**
   * Find turfs near a specific location
   */
  async findTurfs(query, context) {
    return this._postToEngine('/find-turfs', { query, context });
  }
}

module.exports = new AIService();
