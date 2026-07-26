const aiService = require('../services/aiService');

const createEvent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const eventData = await aiService.createEventFromPrompt(prompt);
    res.status(200).json(eventData);
  } catch (error) {
    console.error("[AIController] createEvent error:", error);
    res.status(500).json({ error: error.message || "Failed to create event" });
  }
};

const summarize = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "An array of messages is required" });
    }

    const summaryData = await aiService.summarizeConversation(messages);
    res.status(200).json(summaryData);
  } catch (error) {
    console.error("[AIController] summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize conversation" });
  }
};

const extractTasks = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const tasksData = await aiService.extractTasks(text);
    res.status(200).json(tasksData);
  } catch (error) {
    console.error("[AIController] extractTasks error:", error);
    res.status(500).json({ error: error.message || "Failed to extract tasks" });
  }
};

const tripPlan = async (req, res) => {
  try {
    const { details } = req.body;
    if (!details) {
      return res.status(400).json({ error: "Details are required" });
    }

    const tripData = await aiService.generateTripPlan(details);
    res.status(200).json(tripData);
  } catch (error) {
    console.error("[AIController] tripPlan error:", error);
    res.status(500).json({ error: error.message || "Failed to generate trip plan" });
  }
};

const chat = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const answerData = await aiService.answerEventQuestions(question);
    res.status(200).json(answerData);
  } catch (error) {
    console.error("[AIController] chat error:", error);
    res.status(500).json({ error: error.message || "Failed to answer question" });
  }
};

module.exports = {
  createEvent,
  summarize,
  extractTasks,
  tripPlan,
  chat
};
