# Huddle

Huddle is a modern community and event platform that allows users to discover, create, and join lobbies centered around their interests (Sports, Tech, Arts, Gaming, etc.). It features real-time chat capabilities and an intelligent AI assistant that can help answer questions, find local turfs/venues, and extract actionable tasks from conversations.

## 🚀 Features

- **Discover Lobbies:** Browse live events categorized by topic.
- **Real-Time Chat:** Engage with other participants in real-time within lobby workspaces.
- **AI Integration (@huddle):** 
  - Mention `@huddle` in chat to interact with the Huddle AI assistant.
  - Automatically summarize conversations and extract tasks.
  - Find local turfs and venues.
- **Authentication:** Secure Google Sign-in integration.

## 🏗️ Architecture

The project is structured as a microservices architecture using Docker Compose:

1. **`huddle-web` (Frontend):** 
   - Built with **React** and **Vite**.
   - Uses **TailwindCSS** for responsive, modern glassmorphism styling.
   - Communicates with the backend REST API and connects via **Socket.io** for real-time events.

2. **`huddle-chat-server` (Backend):**
   - Built with **Node.js** and **Express**.
   - Uses **Prisma ORM** with a **PostgreSQL** database.
   - Manages API routes, authentication, and the **Socket.io** WebSocket server.
   - Acts as the orchestrator, forwarding AI requests to the AI engine.

3. **`huddle-ai-engine` (AI Service):**
   - Built with **Python** and **FastAPI**.
   - Integrates with the **Google Gemini API** to process natural language.
   - Responsible for generating structured JSON payloads for AI responses, summaries, and search queries.

## 🛠️ Prerequisites

Make sure you have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

You also need to set up the appropriate `.env` files in `huddle-chat-server` and `huddle-web`, particularly for:
- Database connection URLs
- Google OAuth Client IDs
- Gemini API Keys

## 🏃‍♂️ Running the Project Locally

The entire stack is configured to run easily via Docker Compose.

1. **Start the services:**
   ```bash
   docker compose up --build
   ```
   
2. **Access the application:**
   - **Web App:** http://localhost:5173
   - **Chat Server API:** http://localhost:3001
   - **AI Engine API:** http://localhost:8000

## 📦 Project Structure

```text
Huddle/
├── docker-compose.yml       # Orchestrates all microservices
├── huddle-web/              # React frontend (Vite, Tailwind)
├── huddle-chat-server/      # Node.js backend (Express, Prisma, Socket.io)
└── huddle-ai-engine/        # Python AI microservice (FastAPI, Gemini)
```
