# Personality Chatbot

A chatbot with multiple personalities powered by Groq. Switch between personas like Strict Mentor, Funny Friend, Technical Expert, and more.

## Architecture

- **Frontend**: Vite + React + TypeScript (static SPA)
- **Backend**: FastAPI with SSE streaming (serverless Python)
- **AI**: Groq API (configurable model)

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.12+
- A Groq API key ([get one free](https://console.groq.com))

### Setup

1. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   uvicorn server:app --reload --port 8000
   ```

2. **Frontend** (in a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

The Vite dev server proxies `/api/*` requests to the backend on port 8000.

## Deploy to Vercel

This project is configured to deploy as a single Vercel project using [Vercel Services](https://vercel.com/docs/services).

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO&env=GROQ_API_KEY&envDescription=Groq%20API%20key%20for%20LLM%20inference&envLink=https://console.groq.com)

### Manual Deploy

1. Push this repo to GitHub/GitLab/Bitbucket
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. **Add Environment Variable**:
   - Name: `GROQ_API_KEY`
   - Value: your Groq API key
4. Deploy

### Vercel Project Settings

The project auto-configures from `vercel.json`. No manual settings needed:

- **Root Directory**: `.` (repository root)
- **Framework Preset**: auto-detected per service
- **Build & Output**: auto-configured

### Required Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GROQ_API_KEY` | Groq API key for LLM calls | [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | Model ID (optional, default: `openai/gpt-oss-120b`) | [Groq models](https://console.groq.com/docs/models) |

## Tech Stack

- [Vite](https://vitejs.dev/) - Frontend build tool
- [React](https://react.dev/) - UI library
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Groq](https://groq.com/) - Fast LLM inference
- [Vercel](https://vercel.com/) - Deployment platform
